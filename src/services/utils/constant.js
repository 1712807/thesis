export const DEALBEE_PATHS = {
    homepage: "/",
    login: "/dang-nhap",
    signup: "/dang-ky",
    userProfile: "/nguoi-dung",
    deal: "/deal",
    dealPreview: "/deal/xem-truoc",
    newDeal: "/chia-se-deal",
    searchDeal: "/tim-kiem-deal",
    feedback: "/phan-hoi",
    admin: "/quan-tri",
}
export const MAX_PAGE_WIDTH = "1920px";

export const ADMIN_PAGES = [
    "Quản lý deal",
    "Quản lý người dùng",
    "Quản lý bình luận",
];

export const DEALS_SORT_OPTIONS = [
    {
        value: "latest",
        label: "Mới nhất"
    },
    {
        value: "to_expired",
        label: "Sắp hết hạn"
    },
    {
        value: "most_reputed",
        label: "Người đăng uy tín nhất"
    }
];

export const REPORTED_DEALS_SORT_OPTIONS = [
    {
        value: "oldest",
        label: "Cũ nhất"
    },
    {
        value: "people_reporting",
        label: "Số lượng người báo cáo"
    }
]

export const DEALS_VIEW_OPTIONS = [
    {
        value: "all",
        label: "Tất cả",
    },
    {
        value: "not_viewed",
        label: "Chưa xem"
    },
    {
        value: "viewed",
        label: "Đã xem"
    }
];

export const DEALS_PER_PAGE_OPTIONS = [
    10,
    20,
    30,
];

export const USERS_SORT_OPTIONS = [
    "Hoạt động gần đây",
    "Thành viên mới",
    "Thành viên ưu tú",
];

export const USERS_LEVELS_OPTIONS = [
    {
        key: "all",
        label: "Tất cả",
    },
    {
        key: "admin",
        label: "Quản trị viên",
    },
    {
        key: "editor",
        label: "Biên tập viên",
    },
    {
        key: "moderator",
        label: "Điều hành viên",
    },
    {
        key: "user1",
        label: "Thành viên cấp 1",
    },
    {
        key: "user2",
        label: "Thành viên cấp 2",
    },
    {
        key: "user3",
        label: "Thành viên cấp 3",
    },
    {
        key: "user4",
        label: "Thành viên cấp 4",
    },
    {
        key: "user5",
        label: "Thành viên cấp 5",
    },
];

export const ROLES = [
    {
        key: "admin",
        label: "Quản trị viên",
    },
    {
        key: "editor",
        label: "Biên tập viên",
    },
    {
        key: "moderator",
        label: "Điều hành viên",
    },
    {
        key: "user",
        label: "Người dùng",
    }
]

export const FEATURED_DEALS_PER_PAGE = 5;
export const HOT_DEALS_PER_PAGE = 3;
export const HOT_DEALS_MAX = 15;
export const FLASH_DEALS_MAX = 10;
export const POPULAR_DEALS_PER_PAGE = 3;
export const POPULAR_DEALS_MAX = 15;
export const RECENT_DEALS_PER_PAGE = 10;
export const BEST_DEALS_MAX = 7;
export const DEALS_FOR_USER_PER_PAGE = 6;
export const SEARCH_KEY_DEALS_PER_PAGE = 5;

export const DEAL_COMMENTS_PER_PAGE = 5;
export const RECENT_COMMENTS_PER_PAGE = 5;
export const USERS_DEALS_PER_PAGE = 4;
export const PENDING_DEALS_PER_PAGE = 3;
export const FOLLOWING_DEALS_PER_PAGE = 3;
export const MY_NOTIFICATIONS_PER_PAGE = 10;

export const FLAGS = {
    createUserSuccess: {
        type: "success",
        title: "Thêm người dùng thành công",
    },
    changeUsersRoleSuccess: {
        type: "success",
        title: "Thay đổi vai trò người dùng thành công",
    },
    blockUserSuccess: {
        type: "info",
        title: "Đã khóa tài khoản người dùng"
    },
    unblockUserSuccess: {
        type: "success",
        title: "Đã mở khóa tài khoản người dùng"
    },
    approveDealSuccess: {
        type: "success",
        title: "Deal đã được đăng",
    },
    rejectDealSuccess: {
        type: "warning",
        title: "Deal đã bị từ chối",
    },
    deleteDealSuccess: {
        type: "warning",
        title: "Deal đã bị gỡ"
    },
    ownerDeleteDealSuccess: {
        type: "warning",
        title: "Deal đã bị xóa"
    },
    editInfoSuccess: {
        type: "success",
        title: "Đã lưu thay đổi"
    },
    followDealSuccess: {
        type: "success",
        title: "Bạn đang theo dõi deal"
    },
    unfollowDealSuccess: {
        type: "info",
        title: "Bạn đã hủy theo dõi deal"
    },
    copyLinkSuccess: {
        type: "success",
        title: "Đã sao chép liên kết vào khay nhớ tạm"
    },
    reportDealSuccess: {
        type: "info",
        title: "Bạn đã báo cáo deal"
    },
    unreportDealSuccess: {
        type: "info",
        title: "Bạn đã hủy báo cáo deal"
    },
    updateEditorsNoteSuccesss: {
        type: "success",
        title: "Đã lưu ghi chú mới",
    },
    deleteEditorsNoteSuccess: {
        type: "info",
        title: "Đã xóa ghi chú",
    },
    markDealAsFeaturedSuccess: {
        type: "success",
        title: "Đã thêm deal vào danh sách chọn lọc",
    },
    unmarkDealAsFeaturedSuccess: {
        type: "info",
        title: "Đã xóa deal khỏi danh sách chọn lọc"
    },
    markDealAsExpiredSuccess: {
        type: "info",
        title: "Đã đánh dấu deal hết hạn"
    },
    changeAvatarFail: {
        type: 'error',
        title: "Ảnh có kích thước quá lớn"
    },
}

export const COMPRESSED_IMAGE = {
    quality: 0.3,
    maxWidth: 1024,
    maxHeight: 1024,
  };

export const REPORT_DEAL_TYPES = [
    {
        key: "expired",
        label: "Deal hết hạn",
    },
    {
        key: "wrong_link",
        label: "Không tìm thấy trang bán",
    },
    {
        key: "wrong_info",
        label: "Thông tin sai",
    },
    {
        key: "others",
        label: "Vi phạm khác (vui lòng nêu rõ)",
    }
]

export const FEEDBACK_TYPES = [
    {
        key: "dong_gop",
        label: "Đóng góp ý kiến"
    },
    {
        key: "khieu_nai",
        label: "Khiếu nại"
    },
    {
        key: "others",
        label: "Khác"
    }
]

export const LEVEL_POINTS = [
    0, 600, 2400, 5000, 10000, 15000, 20000, 25000
]

export const TEXT_INPUT_CUSTOM_STYLE = {
    backgroundColor: "transparent !important",
    borderWidth: "1.5px !important",
    borderColor: "#DFE1E6 !important",
    "&:focus-within": {
        borderColor: "rgb(76, 154, 255) !important",
    },
    "&:hover:not(:focus-within)": {
        backgroundColor: "#f1f1f1 !important"
    }
}

export const INPUT_LENGTHS = {
    username: {min: 5, max: 50},
    password: {min: 5, max: 50},
    email: {min: 5, max: 100},
    displayName: {min: 3, max: 100},
    usersIntroduction: {min: 0, max: 500},
    dealTitle: {min: 0, max: 250},
    dealLink: {min: 0, max: 1000},
    dealDescription: {min: 0, max: 10000},
    comment: {min: 0, max: 5000},
    reportContent: {min: 0, max: 500},
    searchField: {min: 0, max: 100},
    note: {min: 0, max: 500}
}

export const USER_POINTS = {
    interaction: 1,
    comments: 5,
    shares: 20,
    reputation_score: 1,
    followers: 2,
}

export const CATEGORIES_COLORS = [
    "steelblue",
    "cadetblue",
    "chocolate",
    "cornflowerblue",
    "darkcyan",
    "darkgoldenrod",
    "peru",
    "blueviolet",
    "brown",
    "darkolivegreen",
    "darkslateblue",
    "darkorange",
]