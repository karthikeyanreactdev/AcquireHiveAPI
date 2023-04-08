const pool = require("../db");

exports.getAllCandidates = async () => {
  const allCandidates = await pool.query("SELECT * FROM candidates");
  return allCandidates.rows;
};

exports.client_creation = async (client) => {
  const clientdata = await pool.query(
    "INSERT INTO Clients (clientname,email,address1,address2,phonenumber,faxnumber,depositedamount,isactive,isdeleted,createdby,modifiedby,companyimageurl, zipcode,statee,city,transactionid, createddatetime,qbcustomerid,clientid,rechargeamount,minimumbalance) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21) RETURNING *",
    [
      client.clientname,
      client.email,
      client.address,
      client.address1,
      client.phoneNumber,
      client.faxNumber,
      client.depositedAmount,
      client.isActive,
      client.isDeleted,
      client.createdBy,
      client.modifiedBy,
      client.companyImageURL,
      client.zipcode,
      client.state,
      client.city,
      client.transactionid,
      client.createdDateTime,
      client.qbcustomerid,
      client.clientid,
      client.rechargeamount,
      client.minimumbalance,
    ]
  );
  if (clientdata.rows.length) {
    const trans = await transaction_route.transaction_creation(client);
  }
  return clientdata.rows;
};
