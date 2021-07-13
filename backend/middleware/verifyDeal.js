const db = require("../db");

function checkIfDealExisted(req, res, next) {
  try {
    const strSql = 'SELECT * FROM deals WHERE id = $1';
    const values = [req.body.dealId || req.params.dealId || req.query.dealId];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      const deal = resQuery.rows[0];
      if (!deal) {
          res.status(400).send({message: "Deal not existed!"});
          return;
      }
      next()
  })} catch (err) {
    res.status(500).send(err.message);
  }
};

function checkIfDealIsApproved(req, res, next) {
  try {
    const strSql = 'SELECT status FROM deals WHERE id = $1';
    const values = [
      req.body.dealId 
      || req.params.dealId 
      || req.query.dealId 
      || req.params.id 
      || req.query.id
    ];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      const row = resQuery.rows[0];
      if (!row || row.status !== "approved") {
          return res.status(200).send({
            message: row ? "Deal is not approved!" : "Deal is not existed"
          });
      }
      next()
  })} catch (err) {
    res.status(500).send(err.message);
  }
}

const verifyDeal = {
    checkIfDealExisted: checkIfDealExisted,
    checkIfDealIsApproved: checkIfDealIsApproved,
};

module.exports = verifyDeal;