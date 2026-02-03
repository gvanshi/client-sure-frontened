"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Axios from "../../../utils/Axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Heart,
  MessageCircle,
  Send,
  Trash2,
  Image as ImageIcon,
  X,
  TrendingUp,
  RefreshCw,
  Search,
  Filter,
  Award,
  Users,
  MessageSquare,
  ThumbsUp,
  Calendar,
  Sparkles,
  Edit3,
} from "lucide-react";
import ConfirmationModal from "../components/ConfirmationModal";
import BackButton from "../components/BackButton";

interface User {
  _id: string;
  name: string;
  avatar?: string;
}

interface Comment {
  _id: string;
  user_id: User;
  text: string;
  createdAt: string;
}

interface Post {
  _id: string;
  user_id: User;
  post_title: string;
  description: string;
  image?: string;
  likes: { user_id: string }[];
  comments: Comment[];
  createdAt: string;
}

interface LeaderboardUser {
  _id: string;
  name: string;
  avatar?: string;
  points: number;
  rank?: number;
  communityActivity: {
    postsCreated: number;
    commentsMade: number;
    likesGiven: number;
    likesReceived: number;
  };
}

interface LeaderboardData {
  topUsers: LeaderboardUser[];
  currentUserRank?: {
    user: LeaderboardUser;
    rank: number;
    totalUsers: number;
  };
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData>({
    topUsers: [],
  });
  const [loading, setLoading] = useState(true);

  const [commentTexts, setCommentTexts] = useState<{ [key: string]: string }>(
    {},
  );
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentUserName, setCurrentUserName] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showTrending, setShowTrending] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    author: "",
    hasImage: false,
    dateFrom: "",
    dateTo: "",
    sortBy: "latest",
    minLikes: 0,
  });
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [communityStats, setCommunityStats] = useState<any>({});

  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Edit post state
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editPostData, setEditPostData] = useState<{
    title: string;
    description: string;
  }>({ title: "", description: "" });
  const [editSelectedImage, setEditSelectedImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [dailyLimits, setDailyLimits] = useState({
    posts: 10,
    likes: 10,
    comments: 10,
  });
  const [maxLimits] = useState({
    posts: 10,
    likes: 10,
    comments: 10,
  });
  const [visibleComments, setVisibleComments] = useState<{
    [key: string]: boolean;
  }>({});

  // Delete confirmation state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Create post state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPostData, setNewPostData] = useState({
    title: "",
    description: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchData();
    getCurrentUser();
    fetchDailyLimits();

    // Auto-refresh every 60 seconds (silent)
    const refreshInterval = setInterval(() => {
      fetchData(true); // Silent refresh
      fetchDailyLimits(true); // Silent limits refresh
    }, 60000);

    // Refresh when window gets focus (silent)
    const handleWindowFocus = () => {
      fetchData(true); // Silent refresh
      fetchDailyLimits(true); // Silent limits refresh
    };

    window.addEventListener("focus", handleWindowFocus);

    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  // Auto-fetch when search or trending changes
  useEffect(() => {
    fetchData(false);
  }, [searchQuery, showTrending]);

  // Client-side filtering
  useEffect(() => {
    let filtered = [...allPosts];

    // Filter by author
    if (searchFilters.author) {
      filtered = filtered.filter((post) =>
        post.user_id?.name
          ?.toLowerCase()
          .includes(searchFilters.author.toLowerCase()),
      );
    }

    // Filter by has image
    if (searchFilters.hasImage) {
      filtered = filtered.filter((post) => post.image);
    }

    // Filter by date range
    if (searchFilters.dateFrom) {
      const fromDate = new Date(searchFilters.dateFrom);
      filtered = filtered.filter(
        (post) => new Date(post.createdAt) >= fromDate,
      );
    }
    if (searchFilters.dateTo) {
      const toDate = new Date(searchFilters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter((post) => new Date(post.createdAt) <= toDate);
    }

    // Filter by minimum likes
    if (searchFilters.minLikes > 0) {
      filtered = filtered.filter(
        (post) => post.likes.length >= searchFilters.minLikes,
      );
    }

    // Sort
    switch (searchFilters.sortBy) {
      case "latest":
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
      case "oldest":
        filtered.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        break;
      case "popular":
        filtered.sort((a, b) => b.likes.length - a.likes.length);
        break;
      case "trending":
        // Trending: combination of likes and comments with recency
        filtered.sort((a, b) => {
          const scoreA =
            (a.likes.length * 2 + a.comments.length) /
            Math.max(
              1,
              (Date.now() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60),
            );
          const scoreB =
            (b.likes.length * 2 + b.comments.length) /
            Math.max(
              1,
              (Date.now() - new Date(b.createdAt).getTime()) / (1000 * 60 * 60),
            );
          return scoreB - scoreA;
        });
        break;
    }

    setPosts(filtered);
  }, [allPosts, searchFilters]);

  const resetFilters = () => {
    setSearchFilters({
      author: "",
      hasImage: false,
      dateFrom: "",
      dateTo: "",
      sortBy: "latest",
      minLikes: 0,
    });
  };

  const getCurrentUser = async () => {
    try {
      const response = await Axios.get("/auth/profile");
      setCurrentUserId(response.data.user._id);
      setCurrentUserName(response.data.user.name || "User");
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchDailyLimits = async (silent = false) => {
    try {
      const response = await Axios.get("/community/daily-limits");
      if (response.data.success) {
        setDailyLimits(response.data.remainingLimits);

        // Show exhausted message if all limits are exhausted
        if (!silent && response.data.allExhausted) {
          toast.error(
            "Aaj ke liye aapki saari community limits khatam ho gayi hain",
          );
        }
      }
    } catch (error) {
      if (!silent) {
        console.error("Error fetching daily limits:", error);
      }
    }
  };

  const updateLimitsFromResponse = (responseData: any) => {
    if (responseData.remainingLimits) {
      setDailyLimits(responseData.remainingLimits);
    }

    // Show limit exhausted messages
    if (responseData.limitType && responseData.remainingLimits) {
      const remaining = responseData.remainingLimits[responseData.limitType];
      if (remaining === 0) {
        const messages = {
          posts: "Aaj ke liye aapki post limit khatam ho gayi hai",
          likes: "Aaj ke liye aapki like limit khatam ho gayi hai",
          comments: "Aaj ke liye aapki comment limit khatam ho gayi hai",
        };
        toast.error(messages[responseData.limitType as keyof typeof messages]);
      }
    }

    if (responseData.allExhausted) {
      toast.error(
        "Aaj ke liye aapki saari community limits khatam ho gayi hain",
      );
    }
  };

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      let endpoint = showTrending ? "/community/trending" : "/community/posts";

      // Build query parameters
      const queryParams = new URLSearchParams();

      if (searchQuery) queryParams.append("search", searchQuery);

      const params = queryParams.toString() ? `?${queryParams.toString()}` : "";

      const [postsRes, leaderboardRes, statsRes] = await Promise.all([
        Axios.get(`${endpoint}${params}`),
        Axios.get("/community/leaderboard?limit=10&includeCurrentUser=true"),
        Axios.get("/community/stats"),
      ]);
      setAllPosts(postsRes.data.posts);
      setPosts(postsRes.data.posts);

      // Handle new leaderboard structure
      if (leaderboardRes.data.topUsers) {
        setLeaderboardData({
          topUsers: leaderboardRes.data.topUsers,
          currentUserRank: leaderboardRes.data.currentUserRank,
        });
      } else {
        // Fallback for old API structure
        setLeaderboard(leaderboardRes.data.leaderboard || []);
      }

      setCommunityStats(statsRes.data);
      setLastUpdated(new Date());
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error("Subscription expired. Please renew to access community.");
        router.push("/user/dashboard");
      } else {
        if (!silent) toast.error("Error loading community data");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (postId: string) => {
    setPostToDelete(postId);
    setShowDeleteModal(true);
  };

  const confirmDeletePost = async () => {
    if (!postToDelete) return;

    setIsDeleting(true);
    try {
      const response = await Axios.delete(`/community/post/${postToDelete}`);

      if (response.data.success) {
        toast.success("Post deleted (-5 points)");

        // Update daily limits if returned from backend
        if (response.data.remainingLimits) {
          setDailyLimits(response.data.remainingLimits);
        }

        fetchData(false);
      } else {
        // Fallback for old API response structure
        toast.success("Post deleted (-5 points)");
        fetchData(false);
      }

      setShowDeleteModal(false);
      setPostToDelete(null);
    } catch (error: any) {
      console.error("Delete post error:", error);
      toast.error(error.response?.data?.message || "Error deleting post");
    } finally {
      setIsDeleting(false);
    }
  };

  // Create post functions
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const cancelCreatePost = () => {
    setShowCreateForm(false);
    setNewPostData({ title: "", description: "" });
    setSelectedImage(null);
    setImagePreview(null);
  };

  const createPost = async () => {
    if (!newPostData.title.trim() || !newPostData.description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    if (dailyLimits.posts === 0) {
      toast.error("Daily post limit reached. Try again tomorrow!");
      return;
    }

    setIsCreating(true);
    try {
      const formData = new FormData();
      formData.append("post_title", newPostData.title);
      formData.append("description", newPostData.description);
      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const response = await Axios.post("/community/post", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success("Post created! (+5 points)");
        updateLimitsFromResponse(response.data);
        setShowCreateForm(false);
        setNewPostData({ title: "", description: "" });
        setSelectedImage(null);
        setImagePreview(null);
        fetchData(false);
      }
    } catch (error: any) {
      const errorData = error.response?.data;
      if (errorData && (errorData.limitType || errorData.allExhausted)) {
        updateLimitsFromResponse(errorData);
      } else {
        toast.error(errorData?.message || "Error creating post");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const startEdit = (post: Post) => {
    setEditingPostId(post._id);
    setEditPostData({ title: post.post_title, description: post.description });
    setEditSelectedImage(null);
    setEditImagePreview(post.image || null);
  };

  const cancelEdit = () => {
    setEditingPostId(null);
    setEditPostData({ title: "", description: "" });
    setEditSelectedImage(null);
    setEditImagePreview(null);
    setIsUpdating(false);
  };

  const submitEdit = async (postId: string) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append("post_title", editPostData.title);
      formData.append("description", editPostData.description);
      if (editSelectedImage) formData.append("image", editSelectedImage);

      const response = await Axios.put(`/community/post/${postId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        toast.success("Post updated successfully");
        fetchData(false);
        cancelEdit();
      } else {
        toast.success("Post updated successfully");
        fetchData(false);
        cancelEdit();
      }
    } catch (error: any) {
      console.error("Update post error:", error);
      const errorMessage =
        error.response?.data?.message || "Error updating post";
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const likePost = async (postId: string) => {
    try {
      const post = posts.find((p) => p._id === postId);
      if (!post || isLikedByUser(post)) {
        toast.error("Post already liked");
        return;
      }

      // Optimistic update - immediately update UI
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p._id === postId
            ? { ...p, likes: [...p.likes, { user_id: currentUserId }] }
            : p,
        ),
      );

      const response = await Axios.post(`/community/like/${postId}`);
      if (response.data.success) {
        toast.success("Post liked! (+1 point to author)");
        updateLimitsFromResponse(response.data);
      }
      fetchData(true); // Sync with backend
    } catch (error: any) {
      // Revert optimistic update on error
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p._id === postId
            ? {
                ...p,
                likes: p.likes.filter(
                  (like) => String(like.user_id) !== currentUserId,
                ),
              }
            : p,
        ),
      );

      const errorData = error.response?.data;
      if (errorData && (errorData.limitType || errorData.allExhausted)) {
        updateLimitsFromResponse(errorData);
      } else {
        toast.error(errorData?.message || "Error liking post");
      }
    }
  };

  const unlikePost = async (postId: string) => {
    try {
      const post = posts.find((p) => p._id === postId);
      if (!post || !isLikedByUser(post)) {
        toast.error("You have not liked this post yet");
        return;
      }

      // Optimistic update - immediately update UI
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p._id === postId
            ? {
                ...p,
                likes: p.likes.filter(
                  (like) => String(like.user_id) !== currentUserId,
                ),
              }
            : p,
        ),
      );

      await Axios.post(`/community/unlike/${postId}`);
      toast.success("Post unliked (-1 point from author)");
      fetchData(true); // Sync with backend
    } catch (error: any) {
      // Revert optimistic update on error
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p._id === postId
            ? { ...p, likes: [...p.likes, { user_id: currentUserId }] }
            : p,
        ),
      );
      const errorMessage =
        error.response?.data?.message || "Error unliking post";
      toast.error(errorMessage);
    }
  };

  const addComment = async (postId: string) => {
    const text = commentTexts[postId];
    if (!text?.trim()) return;

    try {
      const response = await Axios.post(`/community/comment/${postId}`, {
        text,
      });
      if (response.data.success) {
        toast.success("Comment added! (+2 points)");
        updateLimitsFromResponse(response.data);
      }
      setCommentTexts({ ...commentTexts, [postId]: "" });
      fetchData(false);
    } catch (error: any) {
      const errorData = error.response?.data;
      if (errorData && (errorData.limitType || errorData.allExhausted)) {
        updateLimitsFromResponse(errorData);
      } else {
        toast.error(errorData?.message || "Error adding comment");
      }
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      await Axios.delete(`/community/comment/${commentId}`);
      toast.success("Comment deleted (-2 points)");
      fetchData(false);
    } catch (error) {
      toast.error("Error deleting comment");
    }
  };

  // Focus the comment input for a given post
  const focusCommentInput = (postId: string) => {
    if (dailyLimits.comments === 0) {
      toast.error("Aaj ke liye aapki comment limit khatam ho gayi hai");
      return;
    }
    const el = document.getElementById(
      `comment-input-${postId}`,
    ) as HTMLInputElement | null;
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const toggleComments = (postId: string) => {
    setVisibleComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const isLikedByUser = (post: Post) => {
    if (!currentUserId) return false;

    return post.likes.some((like) => {
      return String(like.user_id) === currentUserId;
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
            <div className="text-xl text-gray-700 font-medium">
              Loading community...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header - Moved outside flex container to stay at top */}
        <div className="mb-4">
          <BackButton />
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="bg-white border-b border-gray-200 p-4 md:p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    Community
                  </h1>
                  <p className="text-gray-600 flex items-center gap-2 text-sm">
                    <MessageSquare className="w-4 h-4" />
                    {communityStats.totalPosts || 0} posts •
                    <Users className="w-4 h-4 ml-1" />
                    {communityStats.activeMembers || 0} members
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    showAdvancedSearch
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Filter className="w-4 h-4" /> Filters
                </button>
                <button
                  onClick={() => {
                    setShowTrending(!showTrending);
                    setSearchFilters({
                      ...searchFilters,
                      sortBy: showTrending ? "latest" : "popular",
                    });
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    showTrending
                      ? "bg-orange-500 text-white hover:bg-orange-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {showTrending ? (
                    <>
                      <TrendingUp className="w-4 h-4" /> Trending
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" /> Latest
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    fetchData(false);
                    toast.success("Community refreshed!");
                  }}
                  className="p-2 rounded-lg transition-all bg-gray-100 text-gray-700 hover:bg-gray-200"
                  title="Refresh community posts"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Daily Limits Display */}
          <div className="px-4 pb-4 md:px-6 md:pb-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Daily Limits
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Posts Limit */}
                <div className="text-center">
                  <div className="relative w-12 h-12 mx-auto mb-2">
                    <svg
                      className="w-12 h-12 transform -rotate-90"
                      viewBox="0 0 36 36"
                    >
                      <path
                        className="text-gray-200"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={`${dailyLimits.posts > 3 ? "text-green-500" : dailyLimits.posts > 0 ? "text-yellow-500" : "text-red-500"}`}
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        fill="none"
                        strokeDasharray={`${(dailyLimits.posts / maxLimits.posts) * 100}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-700">
                        {dailyLimits.posts}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-gray-700">Posts</div>
                  <div className="text-xs text-gray-500">
                    {dailyLimits.posts}/{maxLimits.posts}
                  </div>
                </div>

                {/* Likes Limit */}
                <div className="text-center">
                  <div className="relative w-12 h-12 mx-auto mb-2">
                    <svg
                      className="w-12 h-12 transform -rotate-90"
                      viewBox="0 0 36 36"
                    >
                      <path
                        className="text-gray-200"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={`${dailyLimits.likes > 3 ? "text-green-500" : dailyLimits.likes > 0 ? "text-yellow-500" : "text-red-500"}`}
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        fill="none"
                        strokeDasharray={`${(dailyLimits.likes / maxLimits.likes) * 100}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-700">
                        {dailyLimits.likes}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-gray-700">Likes</div>
                  <div className="text-xs text-gray-500">
                    {dailyLimits.likes}/{maxLimits.likes}
                  </div>
                </div>

                {/* Comments Limit */}
                <div className="text-center">
                  <div className="relative w-12 h-12 mx-auto mb-2">
                    <svg
                      className="w-12 h-12 transform -rotate-90"
                      viewBox="0 0 36 36"
                    >
                      <path
                        className="text-gray-200"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={`${dailyLimits.comments > 3 ? "text-green-500" : dailyLimits.comments > 0 ? "text-yellow-500" : "text-red-500"}`}
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        fill="none"
                        strokeDasharray={`${(dailyLimits.comments / maxLimits.comments) * 100}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-700">
                        {dailyLimits.comments}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-gray-700">
                    Comments
                  </div>
                  <div className="text-xs text-gray-500">
                    {dailyLimits.comments}/{maxLimits.comments}
                  </div>
                </div>
              </div>

              <div className="mt-3 text-center">
                <p className="text-xs text-gray-600">
                  Limits reset daily at midnight •
                  {dailyLimits.posts === 0 &&
                  dailyLimits.likes === 0 &&
                  dailyLimits.comments === 0 ? (
                    <span className="text-red-600 font-medium">
                      All limits exhausted
                    </span>
                  ) : (
                    <span className="text-green-600 font-medium">Active</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 max-w-4xl">
            {/* Create Post Input Box */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
              {!showCreateForm ? (
                <div
                  onClick={() =>
                    dailyLimits.posts > 0 && setShowCreateForm(true)
                  }
                  className={`p-4 md:p-6 ${
                    dailyLimits.posts > 0
                      ? "cursor-pointer hover:bg-gray-50"
                      : "cursor-not-allowed opacity-60"
                  } transition-colors`}
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    {/* User Avatar */}
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {currentUserName.charAt(0).toUpperCase() || "U"}
                    </div>

                    {/* Input Prompt */}
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-full px-4 md:px-6 py-3 md:py-3.5 text-gray-500 hover:bg-gray-200 transition-colors">
                        {dailyLimits.posts > 0
                          ? "What's on your mind? Share with the community..."
                          : "Daily post limit reached. Try again tomorrow!"}
                      </div>
                    </div>
                  </div>

      
                </div>
              ) : (
                <div className="p-4 md:p-6">
                  <div className="flex items-start gap-3 md:gap-4 mb-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {currentUserName.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 space-y-3">
                      {/* Title Input */}
                      <input
                        type="text"
                        value={newPostData.title}
                        onChange={(e) =>
                          setNewPostData({
                            ...newPostData,
                            title: e.target.value,
                          })
                        }
                        placeholder="Post title..."
                        maxLength={100}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 placeholder-gray-400"
                        disabled={isCreating}
                        autoFocus
                      />

                      {/* Description Textarea */}
                      <textarea
                        value={newPostData.description}
                        onChange={(e) =>
                          setNewPostData({
                            ...newPostData,
                            description: e.target.value,
                          })
                        }
                        placeholder="What's on your mind? Share with the community..."
                        rows={4}
                        maxLength={2000}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none text-gray-900 placeholder-gray-400"
                        disabled={isCreating}
                      />

                      {/* Character counts */}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{newPostData.title.length}/100</span>
                        <span>{newPostData.description.length}/2000</span>
                      </div>

                      {/* Image Preview */}
                      {imagePreview && (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <button
                            onClick={removeImage}
                            disabled={isCreating}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <label
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer ${
                          isCreating ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <ImageIcon className="w-5 h-5" />
                        <span className="text-sm font-medium hidden sm:inline">
                          Photo
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          disabled={isCreating}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={cancelCreatePost}
                        disabled={isCreating}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={createPost}
                        disabled={
                          isCreating ||
                          !newPostData.title.trim() ||
                          !newPostData.description.trim() ||
                          dailyLimits.posts === 0
                        }
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        {isCreating ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span className="hidden sm:inline">Posting...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span className="hidden sm:inline">Post</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {showAdvancedSearch && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="p-4 md:p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Filter className="w-5 h-5 text-blue-600" /> Advanced
                    Filters
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Author Name
                      </label>
                      <input
                        type="text"
                        value={searchFilters.author}
                        onChange={(e) =>
                          setSearchFilters({
                            ...searchFilters,
                            author: e.target.value,
                          })
                        }
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900"
                        placeholder="Search by author..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sort By
                      </label>
                      <select
                        value={searchFilters.sortBy}
                        onChange={(e) =>
                          setSearchFilters({
                            ...searchFilters,
                            sortBy: e.target.value,
                          })
                        }
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900"
                      >
                        <option value="latest">Latest</option>
                        <option value="popular">Most Liked</option>
                        <option value="trending">Trending</option>
                        <option value="oldest">Oldest</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Likes
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={searchFilters.minLikes}
                        onChange={(e) =>
                          setSearchFilters({
                            ...searchFilters,
                            minLikes: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date From
                      </label>
                      <input
                        type="date"
                        value={searchFilters.dateFrom}
                        onChange={(e) =>
                          setSearchFilters({
                            ...searchFilters,
                            dateFrom: e.target.value,
                          })
                        }
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date To
                      </label>
                      <input
                        type="date"
                        value={searchFilters.dateTo}
                        onChange={(e) =>
                          setSearchFilters({
                            ...searchFilters,
                            dateTo: e.target.value,
                          })
                        }
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900"
                      />
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={searchFilters.hasImage}
                          onChange={(e) =>
                            setSearchFilters({
                              ...searchFilters,
                              hasImage: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Posts with images only
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-6">
                    <button
                      onClick={resetFilters}
                      className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                      Reset Filters
                    </button>
                    <div className="text-sm text-gray-600">
                      Showing {posts.length} of {allPosts.length} posts
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Posts */}
            <div className="space-y-6">
              {posts.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No posts yet
                  </h3>
                  <p className="text-gray-600">
                    Be the first to start a conversation!
                  </p>
                </div>
              ) : (
                posts.map((post) => (
                  <div
                    key={post._id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="p-4 md:p-6">
                      {/* Post Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {(post.user_id?.name || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {post.user_id?.name || "Unknown User"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {getTimeAgo(post.createdAt)}
                            </div>
                          </div>
                        </div>
                        {post.user_id?._id === currentUserId && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEdit(post)}
                              className="text-gray-400 hover:text-gray-700 p-2 rounded-lg transition-colors"
                              title="Edit post"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(post._id)}
                              className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                              title="Delete post"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Post Content */}
                      <div className="mb-4">
                        {editingPostId === post._id ? (
                          <div className="space-y-4">
                            <input
                              type="text"
                              value={editPostData.title}
                              onChange={(e) =>
                                setEditPostData({
                                  ...editPostData,
                                  title: e.target.value,
                                })
                              }
                              className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                            />
                            <textarea
                              value={editPostData.description}
                              onChange={(e) =>
                                setEditPostData({
                                  ...editPostData,
                                  description: e.target.value,
                                })
                              }
                              className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 h-32 resize-none focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                            />

                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2 cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors h-10 whitespace-nowrap">
                                <ImageIcon className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">
                                  Change Image
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    setEditSelectedImage(file);
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (ev) =>
                                        setEditImagePreview(
                                          ev.target?.result as string,
                                        );
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                  className="hidden"
                                />
                              </label>

                              {editImagePreview && (
                                <div className="relative inline-block">
                                  <img
                                    src={editImagePreview}
                                    alt="Preview"
                                    className="max-w-xs max-h-48 rounded-lg shadow-md object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditSelectedImage(null);
                                      setEditImagePreview(null);
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              )}

                              <div className="ml-auto flex gap-2">
                                <button
                                  onClick={() => cancelEdit()}
                                  type="button"
                                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => submitEdit(post._id)}
                                  type="button"
                                  disabled={isUpdating}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isUpdating ? "Updating..." : "Save"}
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <h3 className="font-semibold text-gray-900 text-lg mb-2">
                              {post.post_title}
                            </h3>
                            <p className="text-gray-700 leading-relaxed">
                              {post.description}
                            </p>

                            {post.image && (
                              <div className="mt-3">
                                <img
                                  src={post.image}
                                  alt="Post image"
                                  className="rounded-lg max-w-full h-auto max-h-80 object-cover border border-gray-200"
                                />
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Post Actions */}
                      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                        <button
                          onClick={() => {
                            if (isLikedByUser(post)) {
                              unlikePost(post._id);
                            } else {
                              if (dailyLimits.likes === 0) {
                                toast.error(
                                  "Aaj ke liye aapki like limit khatam ho gayi hai",
                                );
                                return;
                              }
                              likePost(post._id);
                            }
                          }}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm font-medium ${
                            isLikedByUser(post)
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : dailyLimits.likes === 0
                                ? "text-gray-400 cursor-not-allowed opacity-60"
                                : "text-gray-600 hover:bg-gray-50"
                          }`}
                          disabled={
                            !isLikedByUser(post) && dailyLimits.likes === 0
                          }
                          title={
                            !isLikedByUser(post) && dailyLimits.likes === 0
                              ? "Daily like limit reached"
                              : ""
                          }
                        >
                          <Heart
                            className={`w-4 h-4 ${isLikedByUser(post) ? "fill-current" : ""}`}
                          />
                          <span>{post.likes.length}</span>
                        </button>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <button
                            type="button"
                            onClick={() => toggleComments(post._id)}
                            className={`flex items-center gap-2 text-sm hover:text-gray-700 transition-colors ${
                              visibleComments[post._id]
                                ? "text-blue-600 font-medium"
                                : "text-gray-500"
                            }`}
                            title={
                              visibleComments[post._id]
                                ? "Hide comments"
                                : "Show comments"
                            }
                          >
                            <MessageCircle
                              className={`w-4 h-4 ${visibleComments[post._id] ? "fill-current" : ""}`}
                            />
                            <span>{post.comments.length} comments</span>
                          </button>
                        </div>
                      </div>

                      {/* Comments Section */}
                      {visibleComments[post._id] && (
                        <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                          {post.comments.length > 0 && (
                            <div className="space-y-3 mb-4">
                              <h4 className="font-medium text-gray-900 text-sm">
                                Comments
                              </h4>
                              {post.comments
                                .sort(
                                  (a, b) =>
                                    new Date(b.createdAt).getTime() -
                                    new Date(a.createdAt).getTime(),
                                )
                                .map((comment) => (
                                  <div
                                    key={comment._id}
                                    className="bg-gray-50 rounded-lg p-3"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-xs">
                                            {(comment.user_id?.name || "U")
                                              .charAt(0)
                                              .toUpperCase()}
                                          </div>
                                          <span className="font-medium text-gray-900 text-sm">
                                            {comment.user_id?.name ||
                                              "Unknown User"}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            {getTimeAgo(comment.createdAt)}
                                          </span>
                                        </div>
                                        <p className="text-gray-700 text-sm ml-8">
                                          {comment.text}
                                        </p>
                                      </div>
                                      {comment.user_id?._id ===
                                        currentUserId && (
                                        <button
                                          onClick={() =>
                                            deleteComment(comment._id)
                                          }
                                          className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}

                          {/* Add Comment */}
                          <div className="flex gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                              <MessageCircle className="w-4 h-4" />
                            </div>
                            <input
                              id={`comment-input-${post._id}`}
                              type="text"
                              placeholder={
                                dailyLimits.comments === 0
                                  ? "Comment limit reached"
                                  : "Write a comment..."
                              }
                              value={commentTexts[post._id] || ""}
                              onChange={(e) =>
                                setCommentTexts({
                                  ...commentTexts,
                                  [post._id]: e.target.value,
                                })
                              }
                              className={`flex-1 p-2 border rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 transition-colors text-sm ${
                                dailyLimits.comments === 0
                                  ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                              }`}
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  if (dailyLimits.comments === 0) {
                                    toast.error(
                                      "Aaj ke liye aapki comment limit khatam ho gayi hai",
                                    );
                                    return;
                                  }
                                  addComment(post._id);
                                }
                              }}
                              disabled={dailyLimits.comments === 0}
                            />
                            <button
                              onClick={() => {
                                if (dailyLimits.comments === 0) {
                                  toast.error(
                                    "Aaj ke liye aapki comment limit khatam ho gayi hai",
                                  );
                                  return;
                                }
                                addComment(post._id);
                              }}
                              className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 text-sm ${
                                dailyLimits.comments === 0
                                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                  : "bg-blue-600 hover:bg-blue-700 text-white"
                              }`}
                              disabled={dailyLimits.comments === 0}
                              title={
                                dailyLimits.comments === 0
                                  ? `Daily comment limit reached (${dailyLimits.comments}/10)`
                                  : `${dailyLimits.comments} comments left`
                              }
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Leaderboard Sidebar */}
          <div className="w-full lg:w-80 bg-white rounded-lg shadow-sm border border-gray-200 h-fit lg:sticky lg:top-8">
            <div className="bg-white border-b border-gray-200 p-4 md:p-6 rounded-t-lg">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" /> Leaderboard
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Top community members
              </p>
            </div>

            <div className="p-4">
              {leaderboardData.topUsers.length === 0 &&
              leaderboard.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No rankings yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Top 10 Users */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4 text-yellow-500" />
                      Top 10 Leaders
                    </div>

                    {(leaderboardData.topUsers.length > 0
                      ? leaderboardData.topUsers
                      : leaderboard.slice(0, 10)
                    ).map((user, index) => {
                      const isCurrentUser = user._id === currentUserId;
                      return (
                        <div
                          key={user._id}
                          className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                            isCurrentUser
                              ? "bg-blue-50 border-2 border-blue-200 shadow-sm"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <div
                            className={`text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-sm ${
                              index === 0
                                ? "bg-yellow-500 text-white"
                                : index === 1
                                  ? "bg-gray-400 text-white"
                                  : index === 2
                                    ? "bg-orange-500 text-white"
                                    : isCurrentUser
                                      ? "bg-purple-600 text-white"
                                      : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {index + 1}
                          </div>

                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm ${
                              isCurrentUser ? "bg-purple-600" : "bg-blue-600"
                            }`}
                          >
                            {(user.name || "U").charAt(0).toUpperCase()}
                          </div>

                          <div className="flex-1">
                            <div
                              className={`font-semibold text-sm ${
                                isCurrentUser
                                  ? "text-blue-900"
                                  : "text-gray-900"
                              }`}
                            >
                              {user.name || "Unknown User"}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-600 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-yellow-500" />
                              <span className="font-medium">
                                {user.points}
                              </span>{" "}
                              points
                            </div>
                          </div>

                          {index < 3 && (
                            <div className="flex items-center">
                              {index === 0 && <div className="text-lg">🥇</div>}
                              {index === 1 && <div className="text-lg">🥈</div>}
                              {index === 2 && <div className="text-lg">🥉</div>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Current User Rank (if not in top 10) */}
                  {leaderboardData.currentUserRank &&
                    leaderboardData.currentUserRank.rank > 10 && (
                      <div className="mt-6">
                        <div className="border-t border-gray-200 pt-4">
                          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-500" />
                            Your Ranking
                          </div>

                          <div className="flex items-center gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg shadow-sm">
                            <div className="text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center bg-purple-600 text-white shadow-sm">
                              #{leaderboardData.currentUserRank.rank}
                            </div>

                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold bg-purple-600 shadow-sm">
                              {leaderboardData.currentUserRank.user.name
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="flex-1">
                              <div className="font-semibold text-blue-900 flex items-center gap-2">
                                {leaderboardData.currentUserRank.user.name}
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                  You
                                </span>
                              </div>
                              <div className="text-xs text-gray-600 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-yellow-500" />
                                <span className="font-medium">
                                  {leaderboardData.currentUserRank.user.points}
                                </span>{" "}
                                points
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Rank {leaderboardData.currentUserRank.rank} of{" "}
                                {leaderboardData.currentUserRank.totalUsers}{" "}
                                members
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-xs text-gray-600 font-medium">
                                Keep going!
                              </div>
                              <div className="text-xs text-blue-600">🚀</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Stats Footer */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-500 text-center">
                      🏆 Rankings update every hour
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          if (!isDeleting) {
            setShowDeleteModal(false);
            setPostToDelete(null);
          }
        }}
        onConfirm={confirmDeletePost}
        title="Delete Post?"
        message="Are you sure you want to delete this post? This action cannot be undone. Any points earned from this post will be deducted."
        confirmText="Delete Post"
        isDeleting={isDeleting}
      />
    </div>
  );
}
