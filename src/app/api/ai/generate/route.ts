import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const ALLOWED_TOOLS = new Set(['emails', 'whatsapp', 'linkedin', 'contracts', 'text']);

// Rate limiting: In-memory store (use Redis in production for distributed systems)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 20; // 20 requests per minute

// Response cache: In-memory LRU cache
const responseCache = new Map<string, { response: string; expiresAt: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const MAX_CACHE_SIZE = 100;

// Generate cache key from prompt
function getCacheKey(prompt: string, tool: string): string {
  return crypto.createHash('sha256').update(`${tool}:${prompt}`).digest('hex');
}

// Clean expired cache entries
function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, value] of responseCache.entries()) {
    if (value.expiresAt < now) {
      responseCache.delete(key);
    }
  }
}

// LRU cache eviction
function evictOldestCache() {
  if (responseCache.size >= MAX_CACHE_SIZE) {
    const firstKey = responseCache.keys().next().value;
    if (firstKey) responseCache.delete(firstKey);
  }
}

// Rate limiting check
function checkRateLimit(identifier: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);
  
  if (!record || record.resetAt < now) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true };
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }
  
  record.count++;
  return { allowed: true };
}

// Clean expired rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean every minute

export async function POST(request: NextRequest) {
  try {
    const { prompt, tool, expectJson } = await request.json();
    
    // Get client identifier (IP or session)
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const identifier = clientIp.split(',')[0].trim();
    
    // Rate limiting check
    const rateLimitResult = checkRateLimit(identifier);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many requests. Please wait a moment.',
          retryAfter: rateLimitResult.retryAfter 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
            'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(Date.now() + (rateLimitResult.retryAfter || 60) * 1000).toISOString()
          }
        }
      );
    }
    
    // Validate inputs
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Invalid prompt provided' },
        { status: 400 }
      );
    }
    
    const safeTool = ALLOWED_TOOLS.has(tool) ? tool : 'text';
    
    // Check cache first
    const cacheKey = getCacheKey(prompt, safeTool);
    const cached = responseCache.get(cacheKey);
    
    if (cached && cached.expiresAt > Date.now()) {
      console.log('Cache hit for prompt:', prompt.substring(0, 50) + '...');
      return NextResponse.json({ 
        text: cached.response,
        cached: true 
      });
    }
    
    // Try Gemini AI first
    const apiKey = process.env.GEMINI_API_KEY;
    
    console.log('🔑 API Key Status:', {
      exists: !!apiKey,
      length: apiKey?.length || 0,
      preview: apiKey ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}` : 'NOT_FOUND'
    });
    
    if (apiKey) {
      try {
        console.log('🤖 Initializing Gemini AI...');
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Try different model names in order of preference
        const modelNames = [
          'gemini-1.5-flash',
          'gemini-1.5-pro',
          'gemini-1.0-pro',
          'text-bison-001'
        ];
        
        let selectedModel = 'gemini-pro'; // fallback
        
        // Try each model until one works
        for (const modelName of modelNames) {
          try {
            console.log('🎯 Trying model:', modelName);
            const testModel = genAI.getGenerativeModel({ model: modelName });
            selectedModel = modelName;
            console.log('✅ Model available:', selectedModel);
            break;
          } catch (modelError) {
            console.log('❌ Model not available:', modelName);
            continue;
          }
        }
        
        const model = genAI.getGenerativeModel({ 
          model: selectedModel,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        });
        
        console.log('📤 Sending prompt to Gemini (length:', prompt.length, 'chars)');
        console.log('📝 Prompt preview:', prompt.substring(0, 150) + '...');
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log('✅ Gemini response received (length:', text.length, 'chars)');
        console.log('📝 Response preview:', text.substring(0, 200) + '...');
        
        if (text && text.trim()) {
          // Cache the response
          cleanExpiredCache();
          evictOldestCache();
          responseCache.set(cacheKey, {
            response: text.trim(),
            expiresAt: Date.now() + CACHE_TTL
          });
          
          return NextResponse.json({ 
            text: text.trim(),
            cached: false 
          });
        }
      } catch (geminiError: any) {
        console.error('❌ Gemini API error:', geminiError.message || geminiError);
        console.error('🔍 Error details:', {
          name: geminiError.name,
          code: geminiError.code,
          status: geminiError.status
        });
        // Continue to fallback
      }
    } else {
      console.error('⚠️ No Gemini API key found in environment variables');
    }
    
    // Enhanced fallback responses based on actual prompt content
    const fallbackResponse = generateSmartFallback(prompt, tool, expectJson);
    
    // Cache fallback response too
    const fallbackText = await fallbackResponse.json();
    if (fallbackText.text) {
      cleanExpiredCache();
      evictOldestCache();
      responseCache.set(cacheKey, {
        response: fallbackText.text,
        expiresAt: Date.now() + CACHE_TTL
      });
    }
    
    return NextResponse.json({ ...fallbackText, cached: false });
    
  } catch (error: any) {
    console.error('General error:', error.message || error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}

function generateSmartFallback(prompt: string, tool: string, expectJson: boolean) {
  console.log('🔄 Fallback triggered - Extracting details from prompt');
  
  // Check language from the prompt
  const languageMatch = prompt.match(/MANDATORY LANGUAGE REQUIREMENT: You MUST respond ONLY in ([^.\n]+) language/);
  const language = languageMatch ? languageMatch[1].trim() : 'English';
  const isNonEnglish = language !== 'English';
  
  // Language-specific defaults
  const defaults = {
    English: {
      senderName: 'Professional',
      senderRole: 'Founder',
      niche: 'Business',
      target: 'Clients',
      cta: 'Contact us',
      greeting: 'Hi there,',
      benefit: 'improve your business operations'
    },
    Hindi: {
      senderName: 'प्रोफेशनल',
      senderRole: 'संस्थापक',
      niche: 'व्यवसाय',
      target: 'ग्राहक',
      cta: 'हमसे संपर्क करें',
      greeting: 'नमस्ते,',
      benefit: 'अपने व्यवसाय संचालन में सुधार करें'
    },
    Spanish: {
      senderName: 'Profesional',
      senderRole: 'Fundador',
      niche: 'Negocio',
      target: 'Clientes',
      cta: 'Contáctanos',
      greeting: 'Hola,',
      benefit: 'mejorar tus operaciones comerciales'
    },
    French: {
      senderName: 'Professionnel',
      senderRole: 'Fondateur',
      niche: 'Entreprise',
      target: 'Clients',
      cta: 'Contactez-nous',
      greeting: 'Bonjour,',
      benefit: 'améliorer vos opérations commerciales'
    },
    Portuguese: {
      senderName: 'Profissional',
      senderRole: 'Fundador',
      niche: 'Negócio',
      target: 'Clientes',
      cta: 'Entre em contato',
      greeting: 'Olá,',
      benefit: 'melhorar suas operações comerciais'
    },
    German: {
      senderName: 'Professionell',
      senderRole: 'Gründer',
      niche: 'Geschäft',
      target: 'Kunden',
      cta: 'Kontaktieren Sie uns',
      greeting: 'Hallo,',
      benefit: 'Ihre Geschäftsabläufe verbessern'
    },
    Bengali: {
      senderName: 'প্রফেশনাল',
      senderRole: 'প্রতিষ্ঠাতা',
      niche: 'ব্যবসা',
      target: 'গ্রাহক',
      cta: 'যোগাযোগ করুন',
      greeting: 'নমস্কার,',
      benefit: 'আপনার ব্যবসায়িক কার্যক্রম উন্নত করুন'
    },
    Urdu: {
      senderName: 'پیشہ ور',
      senderRole: 'بانی',
      niche: 'کاروبار',
      target: 'گاہک',
      cta: 'ہم سے رابطہ کریں',
      greeting: 'السلام علیکم,',
      benefit: 'اپنے کاروباری آپریشنز کو بہتر بنائیں'
    },
    Arabic: {
      senderName: 'محترف',
      senderRole: 'مؤسس',
      niche: 'عمل',
      target: 'عملاء',
      cta: 'اتصل بنا',
      greeting: 'مرحبا,',
      benefit: 'تحسين عمليات أعمالك'
    }
  };
  
  const langDefaults = defaults[language as keyof typeof defaults] || defaults.English;
  
  // Extract key information from prompt with multiple patterns
  const senderName = prompt.match(/Sender name: ([^.\n]+)/)?.[1]?.trim() || 
                     prompt.match(/I'm ([^,\n]+),/)?.[1]?.trim() || langDefaults.senderName;
  
  const senderRole = prompt.match(/Sender role: ([^.\n]+)/)?.[1]?.trim() || 
                     prompt.match(/Your profession\/role[:\s]+([^\n]+)/)?.[1]?.trim() || langDefaults.senderRole;
  
  const niche = prompt.match(/Niche[:\s]+([^.\n]+)/)?.[1]?.trim() || 
                prompt.match(/Keywords[^:]*:[^,]*, ([^,\n]+)/)?.[1]?.trim() || langDefaults.niche;
  
  const target = prompt.match(/Target audience[:\s]+([^.\n]+)/)?.[1]?.trim() || 
                 prompt.match(/Target[:\s]+([^.\n]+)/)?.[1]?.trim() || langDefaults.target;
  
  const prospectName = prompt.match(/Prospect name[:\s]+([^.\n]+)/)?.[1]?.trim() || '';
  const prospectCompany = prompt.match(/Prospect company[:\s]+([^.\n]+)/)?.[1]?.trim() || '';
  
  const cta = prompt.match(/Include this (?:clear )?CTA \(exact\)[:\s]*["']([^"']+)["']/)?.[1] || 
              prompt.match(/CTA \(exact text\)[:\s]*["']([^"']+)["']/)?.[1] || langDefaults.cta;
  
  const wordLimit = parseInt(prompt.match(/Keep it under (\d+) words/)?.[1] || '100');
  
  console.log('📝 Extracted details:', { senderName, senderRole, niche, target, prospectName, prospectCompany, cta, wordLimit, language });
  
  if (expectJson && tool === 'emails') {
    // Generate personalized email
    const greeting = prospectName ? `${langDefaults.greeting.replace(',', '')} ${prospectName},` : langDefaults.greeting;
    const companyMention = prospectCompany ? ` (${prospectCompany})` : '';
    
    // Create benefit based on niche - simplified for all languages
    const benefit = langDefaults.benefit;
    
    let body = '';
    let subject = '';
    let preview = '';
    
    if (language === 'Hindi') {
      body = `${greeting}\n\nमैं ${senderName} हूं, ${senderRole}${companyMention}। मैं ${target.toLowerCase()} को ${benefit} में मदद करता हूं।\n\nहमने कई ग्राहकों को बढ़िया नतीजे दिए हैं। आइए चर्चा करें कि हम आपकी कैसे मदद कर सकते हैं।\n\n${cta}\n\nसादर,\n${senderName}`;
      subject = `${niche} समाधान आपके लिए`;
      preview = `${greeting.replace(',', '')} आइए आपकी ${niche.toLowerCase()} जरूरतों पर चर्चा करें`;
    } else if (language === 'Spanish') {
      body = `${greeting}\n\nSoy ${senderName}, ${senderRole}${companyMention}. Ayudo a ${target.toLowerCase()} a ${benefit}.\n\nHemos ayudado a muchos clientes a lograr excelentes resultados. Hablemos de cómo podemos ayudarte también.\n\n${cta}\n\nAtentamente,\n${senderName}`;
      subject = `Solución de ${niche} para ti`;
      preview = `${greeting.replace(',', '')} Hablemos de tus necesidades de ${niche.toLowerCase()}`;
    } else if (language === 'French') {
      body = `${greeting}\n\nJe suis ${senderName}, ${senderRole}${companyMention}. J'aide ${target.toLowerCase()} à ${benefit}.\n\nNous avons aidé de nombreux clients à obtenir d'excellents résultats. Discutons de la façon dont nous pouvons vous aider aussi.\n\n${cta}\n\nCordialement,\n${senderName}`;
      subject = `Solution ${niche} pour vous`;
      preview = `${greeting.replace(',', '')} Discutons de vos besoins en ${niche.toLowerCase()}`;
    } else if (language === 'Portuguese') {
      body = `${greeting}\n\nSou ${senderName}, ${senderRole}${companyMention}. Ajudo ${target.toLowerCase()} a ${benefit}.\n\nAjudamos muitos clientes a alcançarem excelentes resultados. Vamos discutir como podemos ajudá-lo também.\n\n${cta}\n\nAtenciosamente,\n${senderName}`;
      subject = `Solução de ${niche} para você`;
      preview = `${greeting.replace(',', '')} Vamos discutir suas necessidades de ${niche.toLowerCase()}`;
    } else if (language === 'German') {
      body = `${greeting}\n\nIch bin ${senderName}, ${senderRole}${companyMention}. Ich helfe ${target.toLowerCase()} dabei, ${benefit}.\n\nWir haben vielen Kunden geholfen, hervorragende Ergebnisse zu erzielen. Lassen Sie uns besprechen, wie wir Ihnen auch helfen können.\n\n${cta}\n\nMit freundlichen Grüßen,\n${senderName}`;
      subject = `${niche} Lösung für Sie`;
      preview = `${greeting.replace(',', '')} Lassen Sie uns über Ihre ${niche.toLowerCase()} Bedürfnisse sprechen`;
    } else if (language === 'Bengali') {
      body = `${greeting}\n\nআমি ${senderName}, ${senderRole}${companyMention}। আমি ${target.toLowerCase()} কে ${benefit} এ সাহায্য করি।\n\nআমরা অনেক গ্রাহককে চমৎকার ফলাফল অর্জনে সাহায্য করেছি। আসুন আলোচনা করি যে আমরা আপনাকে কীভাবে সাহায্য করতে পারি।\n\n${cta}\n\nসবাইকে,\n${senderName}`;
      subject = `আপনার জন্য ${niche} সমাধান`;
      preview = `${greeting.replace(',', '')} আসুন আপনার ${niche.toLowerCase()} চাহিদা নিয়ে আলোচনা করি`;
    } else if (language === 'Urdu') {
      body = `${greeting}\n\nمیں ${senderName} ہوں، ${senderRole}${companyMention}۔ میں ${target.toLowerCase()} کو ${benefit} میں مدد کرتا ہوں۔\n\nہم نے بہت سے گاہکوں کو بہترین نتائج حاصل کرنے میں مدد کی ہے۔ آئیے بات کرتے ہیں کہ ہم آپ کی بھی کیسے مدد کر سکتے ہیں۔\n\n${cta}\n\nبہترین تحائف,\n${senderName}`;
      subject = `آپ کے لیے ${niche} حل`;
      preview = `${greeting.replace(',', '')} آئیے آپ کی ${niche.toLowerCase()} ضروریات پر بات کرتے ہیں`;
    } else if (language === 'Arabic') {
      body = `${greeting}\n\nأنا ${senderName}، ${senderRole}${companyMention}۔ أساعد ${target.toLowerCase()} في ${benefit}.\n\nلقد ساعدنا العديد من العملاء في تحقيق نتائج رائعة. دعونا نناقش كيف يمكننا مساعدتك أيضًا.\n\n${cta}\n\nمع خالص التحية,\n${senderName}`;
      subject = `حل ${niche} لك`;
      preview = `${greeting.replace(',', '')} دعونا نتحدث عن احتياجاتك في ${niche.toLowerCase()}`;
    } else {
      // English fallback
      body = `${greeting}\n\nI'm ${senderName}, ${senderRole}${companyMention}. I help ${target.toLowerCase()} ${benefit}.\n\nWe've helped many clients achieve great results. Let's discuss how we can help you too.\n\n${cta}\n\nBest regards,\n${senderName}`;
      subject = `${niche} Solution for ${prospectName || 'You'}`;
      preview = `${greeting.replace(',', '')} Let's discuss your ${niche.toLowerCase()} needs`;
    }
    
    const response = JSON.stringify({
      subject: subject,
      preview: preview,
      body: body
    });
    
    console.log('✅ Fallback response generated');
    return NextResponse.json({ text: response, fallback: true });
  }
  
  // Generate contextual responses based on tool type
  let response = '';
  
  switch (tool) {
    case 'whatsapp':
      if (language === 'Hindi') {
        response = `नमस्ते! मैं ${senderName} यहां हूं 👋\n${niche} विशेषज्ञ ${target.toLowerCase()} के लिए।\n${cta}`;
      } else if (language === 'Spanish') {
        response = `¡Hola! Soy ${senderName} 👋\nExperto en ${niche} para ${target.toLowerCase()}.\n${cta}`;
      } else if (language === 'French') {
        response = `Salut! Je suis ${senderName} 👋\nExpert ${niche} pour ${target.toLowerCase()}.\n${cta}`;
      } else if (language === 'Portuguese') {
        response = `Oi! Sou ${senderName} 👋\nEspecialista em ${niche} para ${target.toLowerCase()}.\n${cta}`;
      } else if (language === 'German') {
        response = `Hallo! Ich bin ${senderName} 👋\n${niche} Experte für ${target.toLowerCase()}.\n${cta}`;
      } else if (language === 'Bengali') {
        response = `নমস্কার! আমি ${senderName} 👋\n${niche} বিশেষজ্ঞ ${target.toLowerCase()} এর জন্য।\n${cta}`;
      } else if (language === 'Urdu') {
        response = `السلام علیکم! میں ${senderName} ہوں 👋\n${niche} ماہر ${target.toLowerCase()} کے لیے۔\n${cta}`;
      } else if (language === 'Arabic') {
        response = `مرحبا! أنا ${senderName} 👋\nخبير ${niche} لـ ${target.toLowerCase()}.\n${cta}`;
      } else {
        response = `Hi! ${senderName} here 👋\n${niche} expert for ${target.toLowerCase()}.\n${cta}`;
      }
      break;
    case 'linkedin':
      if (language === 'Hindi') {
        response = `नमस्ते! मैं ${senderName} हूं, ${niche} विशेषज्ञ ${target.toLowerCase()} की मदद कर रहा हूं। ${cta}`;
      } else if (language === 'Spanish') {
        response = `¡Hola! Soy ${senderName}, especialista en ${niche} ayudando a ${target.toLowerCase()}. ${cta}`;
      } else if (language === 'French') {
        response = `Bonjour! Je suis ${senderName}, spécialiste ${niche} aidant ${target.toLowerCase()}. ${cta}`;
      } else if (language === 'Portuguese') {
        response = `Olá! Sou ${senderName}, especialista em ${niche} ajudando ${target.toLowerCase()}. ${cta}`;
      } else if (language === 'German') {
        response = `Hallo! Ich bin ${senderName}, ${niche} Spezialist helfe ${target.toLowerCase()}. ${cta}`;
      } else if (language === 'Bengali') {
        response = `নমস্কার! আমি ${senderName}, ${niche} বিশেষজ্ঞ ${target.toLowerCase()} কে সাহায্য করছি। ${cta}`;
      } else if (language === 'Urdu') {
        response = `السلام علیکم! میں ${senderName} ہوں، ${niche} ماہر ${target.toLowerCase()} کی مدد کر رہا ہوں۔ ${cta}`;
      } else if (language === 'Arabic') {
        response = `مرحبا! أنا ${senderName}، خبير ${niche} أساعد ${target.toLowerCase()}. ${cta}`;
      } else {
        response = `Hello! I'm ${senderName}, ${niche} specialist helping ${target.toLowerCase()}. ${cta}`;
      }
      break;
    case 'contracts':
      if (language === 'Hindi') {
        response = `${niche.toUpperCase()} सेवा अनुबंध\n\nप्रदाता: ${senderName}\nग्राहक: [ग्राहक का नाम]\nक्षेत्र: पेशेवर ${niche.toLowerCase()} सेवाएं\n\nशर्तें: मानक उद्योग शर्तें लागू\nअगले कदम: ${cta}`;
      } else if (language === 'Spanish') {
        response = `CONTRATO DE SERVICIOS ${niche.toUpperCase()}\n\nProveedor: ${senderName}\nCliente: [Nombre del Cliente]\nAlcance: Servicios profesionales de ${niche.toLowerCase()}\n\nTérminos: Se aplican términos estándar de la industria\nPróximos Pasos: ${cta}`;
      } else if (language === 'French') {
        response = `CONTRAT DE SERVICES ${niche.toUpperCase()}\n\nFournisseur: ${senderName}\nClient: [Nom du Client]\nPortée: Services professionnels de ${niche.toLowerCase()}\n\nConditions: Conditions standard de l'industrie s'appliquent\nProchaines Étapes: ${cta}`;
      } else if (language === 'Portuguese') {
        response = `CONTRATO DE SERVIÇOS ${niche.toUpperCase()}\n\nFornecedor: ${senderName}\nCliente: [Nome do Cliente]\nEscopo: Serviços profissionais de ${niche.toLowerCase()}\n\nTermos: Termos padrão da indústria se aplicam\nPróximas Etapas: ${cta}`;
      } else if (language === 'German') {
        response = `${niche.toUpperCase()} DIENSTLEISTUNGSVERTRAG\n\nAnbieter: ${senderName}\nKunde: [Kundenname]\nUmfang: Professionelle ${niche.toLowerCase()} Dienstleistungen\n\nBedingungen: Standard-Branchenbedingungen gelten\nNächste Schritte: ${cta}`;
      } else if (language === 'Bengali') {
        response = `${niche.toUpperCase()} সেবা চুক্তি\n\nপ্রদানকারী: ${senderName}\nগ্রাহক: [গ্রাহকের নাম]\nক্ষেত্র: পেশাদার ${niche.toLowerCase()} সেবা\n\nশর্তাবলী: স্ট্যান্ডার্ড ইন্ডাস্ট্রি শর্তাবলী প্রযোজ্য\nপরবর্তী ধাপ: ${cta}`;
      } else if (language === 'Urdu') {
        response = `${niche.toUpperCase()} سروس معاہدہ\n\nفراہم کنندہ: ${senderName}\nکلائنٹ: [کلائنٹ کا نام]\nدائرہ کار: پیشہ ورانہ ${niche.toLowerCase()} خدمات\n\nشرائط: معیاری صنعت کی شرائط لاگو\nاگلے اقدامات: ${cta}`;
      } else if (language === 'Arabic') {
        response = `عقد خدمات ${niche.toUpperCase()}\n\nالمزود: ${senderName}\nالعميل: [اسم العميل]\nالنطاق: خدمات ${niche.toLowerCase()} احترافية\n\nالشروط: تطبق شروط الصناعة القياسية\nالخطوات التالية: ${cta}`;
      } else {
        response = `${niche.toUpperCase()} SERVICE CONTRACT\n\nProvider: ${senderName}\nClient: [Client Name]\nScope: Professional ${niche.toLowerCase()} services\n\nTerms: Standard industry terms apply\nNext Steps: ${cta}`;
      }
      break;
    default:
      if (language === 'Hindi') {
        response = `${senderName} से पेशेवर ${niche.toLowerCase()} सामग्री ${target.toLowerCase()} के लिए। ${cta}`;
      } else if (language === 'Spanish') {
        response = `Contenido profesional de ${niche.toLowerCase()} de ${senderName} para ${target.toLowerCase()}. ${cta}`;
      } else if (language === 'French') {
        response = `Contenu professionnel de ${niche.toLowerCase()} de ${senderName} pour ${target.toLowerCase()}. ${cta}`;
      } else if (language === 'Portuguese') {
        response = `Conteúdo profissional de ${niche.toLowerCase()} de ${senderName} para ${target.toLowerCase()}. ${cta}`;
      } else if (language === 'German') {
        response = `Professioneller ${niche.toLowerCase()} Inhalt von ${senderName} für ${target.toLowerCase()}. ${cta}`;
      } else if (language === 'Bengali') {
        response = `${senderName} থেকে ${target.toLowerCase()} এর জন্য পেশাদার ${niche.toLowerCase()} সামগ্রী। ${cta}`;
      } else if (language === 'Urdu') {
        response = `${senderName} سے ${target.toLowerCase()} کے لیے پیشہ ورانہ ${niche.toLowerCase()} مواد۔ ${cta}`;
      } else if (language === 'Arabic') {
        response = `محتوى ${niche.toLowerCase()} احترافي من ${senderName} لـ ${target.toLowerCase()}. ${cta}`;
      } else {
        response = `Professional ${niche.toLowerCase()} content from ${senderName} for ${target.toLowerCase()}. ${cta}`;
      }
  }
  
  return NextResponse.json({ text: response });
}