const nodemailer = require('nodemailer');
const { getSlug } = require('../utils/common');
const db = require("../db");
const { EMAIL_TYPES } = require('../utils/constant');

const env = {
  GMAIL_USERNAME: 'contact.dealbee@gmail.com',
  OAUTH_CLIENT_ID: '7241027098-qnaa14li91b78f9fmb6i3qcuulo8r5ud.apps.googleusercontent.com',
  OAUTH_CLIENT_SECRET: 'A7AxEZoApImZ1L_7x1bZKbij',
  OAUTH_REFRESH_TOKEN: '1//04egE2NWJpVTlCgYIARAAGAQSNwF-L9IrQQpIgYxQn8LzE1oTaBEWJefVMx3kXqTyKm9ZEu6qTooooAwizMkU9tn1orrqb6MHD5s',
  OAUTH_ACCESS_TOKEN: 'ya29.a0ARrdaM_wh9fBNaYygZi8vhAf1lqiyFA35j7MXzNEKY4irNptejIUQfpLYGOSoydhHeEg7NwQGRHAU4U6r8U-hM9Tb-kSLrAFgUk7YXeX5VIBIyoZWy4rMAhrqzhXIplgh_vuXlA4AtF2esIrVPfKsoKr-zIM',
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    type: "OAUTH2",
    user: env.GMAIL_USERNAME,
    clientId: env.OAUTH_CLIENT_ID,
    clientSecret: env.OAUTH_CLIENT_SECRET,
    accessToken: env.OAUTH_ACCESS_TOKEN,
    refreshToken: env.OAUTH_REFRESH_TOKEN,
  },
});

//addresses: [{email, name}]
//type: EMAIL_TYPES
//params: {newPassword, category, dealInfo: {id, info, ...}}
function sendEmail(addresses, type, params) {
  try {
    const passwordReseted = type === EMAIL_TYPES.passwordReseted;
    const dealId = params.dealInfo ? params.dealInfo.id : null;
    const strSql = `SELECT receivers FROM emails_sent WHERE (deal_id = $1 OR $2 = TRUE) AND type = $3`;
    const values = [dealId, passwordReseted, type];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        console.log(errQuery.message);
        return;
      }
      const receivedAddress = resQuery.rows[0] ? resQuery.rows[0].receivers : [];
      const emailArray = passwordReseted 
        ? addresses
        : addresses.filter((address) => receivedAddress.indexOf(address.email) < 0);

      const receiverEmails = [];
      emailArray.forEach((address) => {
        const {email, displayName} = address;
        receiverEmails.push(email);
        // console.log(`Sending ${type} email to ${email}`);
        transporter.sendMail({
          from: `Dealbee ${env.GMAIL_USERNAME}`,
          to: email,
          ...getEmailContent(type, displayName, params)
        }, function callback(err) {
          if (err) {
            console.log(err.message);
          } else {
            // console.log("Email sent!");
          }
        });
      })

      if (passwordReseted && receivedAddress.length > 0) return;
      const strSql = `INSERT INTO emails_sent (type, deal_id, receivers) VALUES ($1, $2, $3)`;
      const values = [type, dealId, receiverEmails];
      db.query(strSql, values);
    })
  } catch (e) {
    console.log(e.message);
  }
}

function getEmailContent(type, name, params) {
  const {newPassword, category, dealInfo, account, reason} = params;
  const id = dealInfo ? dealInfo.id : null;
  const info = dealInfo ? dealInfo.info : {};
  const { title, price, originalPrice, discount } = info;
  const username = account ? account.username || '' : '';
  const password = account ? account.password || '' : '';
  const role = account ? account.role || '' : ''

  switch (type) {
    case EMAIL_TYPES.passwordReseted: 
      return {
        subject: "Mật khẩu của bạn đã được làm mới",
        html: `Xin chào ${name}, <br/><br/>Mật khẩu tài khoản Dealbee của bạn đã được làm mới theo yêu cầu. <br/>Vui lòng <a href="https://dealbee.vn/dang-nhap">đăng nhập</a> với mật khẩu mới: <b>${newPassword}</b>
        <br/><br/>Hy vọng bạn sẽ có nhiều trải nghiệm tuyệt vời trên hệ thống của chúng tôi!
        <br/><br/>Trân trọng, <br/>Dealbee.`
      };
    case EMAIL_TYPES.newAccount: 
      return {
        subject: "Tài khoản Dealbee mới của bạn",
        html: `Xin chào ${name}, <br/><br/>Chào mừng bạn đến với Dealbee! <br/>Quản trị viên của Dealbee đã tạo một tài khoản mới cho bạn. Hãy <a href="https://dealbee.vn/dang-nhap">đăng nhập vào Dealbee</a> bằng tài khoản này để cập nhật ngay những khuyến mãi mới nhất nhé!
        <br/><br/>Tên đăng nhập: <b>${username}</b> 
        <br/>Mật khẩu: <b>${password}</b>
        <br/>Vai trò: ${role === "admin" ? "Quản trị viên" : role === "editor" ? "Biên tập viên" : role === "moderator" ? "Điều hành viên" : "Người dùng"}
        <br/><br/>Hy vọng bạn sẽ có nhiều trải nghiệm tuyệt vời trên hệ thống của chúng tôi!
        <br/><br/>Trân trọng, <br/>Dealbee.`
      }
    case EMAIL_TYPES.accountBlocked:
      return {
        subject: "Tài khoản Dealbee của bạn đã bị khóa",
        html: `Xin chào ${name}, <br/><br/>Chúng tôi rất tiếc phải thông báo rằng tài khoản <b>@${username}</b> trên Dealbee của bạn đã bị khóa vì lý do: ${reason}.
        <br/><br/>Nếu bạn cho rằng đây là sai sót, vui lòng gửi khiếu nại <a href="https://dealbee.vn/phan-hoi">tại đây</a>.
        <br/><br/>Trân trọng, <br/>Dealbee.`
      }
    case EMAIL_TYPES.accountUnblocked:
      return {
        subject: "Tài khoản Dealbee của bạn đã được mở khóa",
        html: `Xin chào ${name}, <br/><br/>Tài khoản <a href="https://dealbee.vn/">Dealbee</a> của bạn đã được mở khóa. Giờ đây, bạn có thể tiếp tục sử dụng Dealbee bằng tài khoản <b>@${username}</b>. Chúng tôi vô cùng xin lỗi vì sự bất tiện này. Xin cảm ơn bạn đã sử dụng Dealbee!
        <br/><br/>Hy vọng bạn sẽ có nhiều trải nghiệm tuyệt vời trên hệ thống của chúng tôi!
        <br/><br/>Trân trọng, <br/>Dealbee.`
      }
    case EMAIL_TYPES.newDealOnCategory: 
      return {
        subject: `Khuyến mãi mới trên Dealbee`,
        html: `
          <div style='margin-bottom: 14px'>Xin chào ${name}, <br/><br/>Bạn nhận được email này vì bạn đã bật thông báo cho ${category !== "Ngành hàng khác" ? `ngành hàng ${category}` : 'ưu đãi mới'} trên Dealbee. Hãy ghé xem ngay khuyến mãi mới dành cho bạn nhé!</div>
          <a href='https://dealbee.vn/deal/${getSlug(title)}-${id}' target='_blank' style='font-weight: bold'>${title}</a>
          <br/><span style='color:red; font-weight:bold; font-size:20px'>${price}đ </span>
          <span style='color:gray; text-decoration-line:line-through'>${originalPrice}đ</span>
          <span style='color:green; font-weight: bold'> (-${discount}%)</span>
          <br/><br/>Hy vọng bạn sẽ có nhiều trải nghiệm tuyệt vời trên hệ thống của chúng tôi!
          <br/><br/>Trân trọng, <br/>Dealbee.
        `,
      };
    // case EMAIL_TYPES.newReportedDeal:
    //   return {
    //     subject: "Báo cáo deal mới trên Dealbee",
    //     html: `
    //       <div style='margin-bottom: 14px'>${name} ơi, có người dùng đã <b style='color: red'>báo cáo</b> deal <a href='http://localhost:3000/admin?dealId=${id}&isReportedDeal=true' target='_blank' style='font-weight: bold, color: red'>${title}</a> trên Dealbee. Vui lòng kiểm tra ngay khi bạn có thời gian!</div>
    //     `
    //   }
    default: return '';
  }
}

module.exports = {
  sendEmail: sendEmail
};
