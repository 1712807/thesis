import moment from "moment-timezone";
import 'moment/locale/vi';
import { getUserApi } from '../api/users';
import { call } from 'redux-saga/effects';
import { DEALBEE_PATHS, INPUT_LENGTHS, LEVEL_POINTS } from "./constant";
import slugify from "slugify";
import validator from "validator";
import { COMPRESSED_IMAGE } from "./constant";
import Compress from 'compress.js';

export const getCookieData = (cname) => {
    // const cookie = decodeURIComponent(document.cookie);
    // return cookie.slice(cookie.indexOf('=')+1);

    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) === ' ') {
        c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
    }
    }
    return "";
}

export const getOriginalPrice = (price, discount) => { 
    if (!price && !discount) return 0;
    if (discount === 100) return price;
    if (!discount) return price;
    return Math.ceil(price/((100-discount)/100))
}

export const getDiscountFromPrices = (price, originalPrice) => {
    if (!originalPrice && !price) return 0;
    if (!originalPrice) return 100; 
    return Math.floor(100-100*price/originalPrice) 
}

export const getNewPrice = (originalPrice, discount) => {
    if (!originalPrice && !discount) return 0;
    if (!discount) return originalPrice;
    if (discount === 100) return 0;
    return Math.floor(originalPrice*(1-discount/100));
}

export const getPriceText = (price) => {
    let count = 0, res = '';
    const str = price.toString();
    for (let i=str.length-1; i>=0; i--) {
        res = str[i] + res;
        if (++count % 3 === 0 && i > 0) res = '.' + res;
    }
    return res+'đ';
}

export const removeAccents = (str) => {
    return str.normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/đ/g, 'd').replace(/Đ/g, 'D');
  }

export const getRegisterValidationMessage = (field, type) => {
    if (!field || !type) return "";
    const validationMessage = {
        username: {
            existed: "Tên đăng nhập đã được sử dụng!",
            not_found: "Tài khoản không tồn tại. Vui lòng thử lại!",
        },
        email: {
            existed: "Email đã được sử dụng. Vui lòng chọn email khác!",
        },
        password: {
            not_match: "Mật khẩu không chính xác. Vui lòng nhập lại!",
        }
    }
    return validationMessage[`${field}`][`${type}`] || "";
}

export const isInvalidPassword = (password) => {
    return !validator.isStrongPassword(password, {
        minLength: INPUT_LENGTHS.password.min,
        minLowercase: 0, 
        minUppercase: 0, 
        minNumbers: 0, 
        minSymbols: 0, 
        returnScore: false,
    })
}

export const isInvalidUserInfo = (user, {isSignUp, isEditing, isForAdmin}) => {
    const {username, password, displayName, email, role, categoriesList} = user;
    if (!isEditing) {
        if (validator.isEmpty(username)|| username.indexOf(" ") >= 0) return true;
        if (!validator.isLength(username, INPUT_LENGTHS.username)) return true;
        if (isInvalidPassword(password)) return true;
    }
    if (!isSignUp && !isEditing) return false;
    if (!validator.isLength(displayName, INPUT_LENGTHS.displayName)) return true;
    if (!validator.isEmail(email)) return true;
    if (!isForAdmin || isEditing) return false;
    if (!role || (role === "editor" && categoriesList.length === 0)) return true;
    return false;
}

export const getTimeLabel = (time) => {
    moment.locale("vi");
    return moment(time).zone("+07:00").format('llll');
}

export const getTimeRemainingLabel = (time) => {
    moment.locale("vi");
    const label = moment(time).endOf('day').fromNow();
    return `Còn ${label.substring(0, label.lastIndexOf(' '))}`;
}

export const getTimeAgoLabel = (time) => {
    moment.locale("vi");
    let label = moment(time).fromNow();
    if (label === "vài giây tới") label = "vài giây trước";
    return `${label}`;
}

export const getDateFormatted = (date) => {
    return moment(date).zone("+07:00").format("ll")
}

export function* getNewReputationScore(status, username) {
    const res = yield call(getUserApi, username);
    const user = res.data.user;
    const { user_action, point } = user;
    const { reputation_score } = user_action;
    const oldPoint = point;
    const newReputationScore = status ? (reputation_score === null ? 1 : reputation_score + 1) : reputation_score - 1; 
    const result = {oldPoint, newReputationScore}
    return result;
}

export const sortByUserPoint = (user1, user2) => {
    return user1.point < user2.point ? 1 : -1;
}

export const getLevelName = (point) => {
    if (point < 599) return "Tân binh";
    if (point < 2399) return "Ngôi sao mới nổi";
    if (point < 4999) return "Tín đồ săn deal";
    if (point < 9999) return "Thợ săn deal";
    return "Thánh săn deal";
}

export const setLevel = (point) => {
    for (let i = 0; i < LEVEL_POINTS.length; i++) {
        if (point < LEVEL_POINTS[i]) return i;
    }
}

export const isPastDate = (date) => {
    return moment() > moment(date);
}

export const saveLocation = (url) => {
    document.cookie = `prevUrl=${url}; path=/`;
    document.cookie = `prevUrl=${url}; path=${DEALBEE_PATHS.userProfile}`;
    document.cookie = `prevUrl=${url}; path=${DEALBEE_PATHS.deal}`;
}

export const removeTagFromString = (str) => {
    let j = str.indexOf('<'), k = str.indexOf('>');
    while ( j !== -1 && k !== -1) {
        let removedSub = str.substring(j, k + 1);
        str = str.replace(removedSub, str[k-1] === 'p' ? '\n' : '')
        j = str.indexOf('<')
        k = str.indexOf('>')
    }
    for (let i = 0;i<str.length-1;i++) {
        if (str[i] === '\n' && str[i+1] === '\n') {
            str = str.replace(str[i],'');
        }
    }
    return str;
}

export const getSlug = (title, seperator) => {
    return slugify(title, {
        lower: true,
        locale: 'vi',
        strict: true,
        replacement: seperator || '-'
    });
}

export const getLinkToDeal = (id, title) => {
    return `${DEALBEE_PATHS.deal}/${getSlug(title)}-${id}`
}

export const getLinkToDealPreview = (id, title) => {
    return `${DEALBEE_PATHS.dealPreview}/${getSlug(title)}-${id}`
}

export const getLinkToProfile = (username) => {
    return `${DEALBEE_PATHS.userProfile}/${username}`
}

export const hasAdminPermission = (role) => {
    return role === "admin"
}

export const hasEditorPermission = (role) => {
    return role === "admin" || role === "editor"
}

export const hasEditorPermissionOnCategory = (user, category) => {
    const {role, editorsCategories: list} = user;
    if (!hasEditorPermission(role)) return false;
    if (role === "admin") return true;
    if (role === "editor" && list && list.length === 1 && list[0] === "all") return true;
    return list && list.indexOf(category) >= 0;
}

export const hasModeratorPermission = (role) => {
    return role === "admin" || role === "moderator"
}

export const validateAccount = (accountValidation) => {
    let validation = {
        username: "valid",
        password: "valid",
        email: "valid",
        isBlocked: false,
        blockedReason: '',
    }

    if (typeof(accountValidation) === "string" && accountValidation !== "valid") {
        if (accountValidation.indexOf("user_blocked") >= 0) {
            validation.isBlocked = true;
            validation.blockedReason = accountValidation.slice(12, accountValidation.length);
        }
        else {
            const index = accountValidation.indexOf(' ');
            const type = accountValidation.slice(0, index);
            const err = accountValidation.slice(index + 1, accountValidation.length);
            validation[`${type}`] = err; 
        }
    }

    return validation;
}

export const getTruncatedString = (string, length) => {
    if (string.length <= length) return string;
    return `${string.slice(0, length)}...`
}

export const getDocumentTitle = (string) => {
    return `${getTruncatedString(string, 50)} - Dealbee`
}


export const uploadPhoto = async(file) => {
    const compress = new Compress();
    const photoFiles =[file]
    const data = await compress.compress(photoFiles, {
        quality: COMPRESSED_IMAGE.quality,
        maxWidth: COMPRESSED_IMAGE.maxWidth,
        maxHeight: COMPRESSED_IMAGE.maxHeight,
    });
    const newFiles = data.map((item, index) => (
        new File([Compress.convertBase64ToFile(item.data, item.ext)], photoFiles[index].name, {type: 'image'})
    ));
    return newFiles[0]
}

export const getTimes = () => {
    const times = [];
    for (let i = 0; i < 24; i++) {
      times.push(`${i}:00`);
    }
    return times;
  };