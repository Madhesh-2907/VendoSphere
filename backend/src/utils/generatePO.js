const generatePONumber = (id) => {
  const year = new Date().getFullYear();
  const sequence = String(id || Math.floor(Math.random() * 9000) + 1000).padStart(4, '0');
  return `PO-${year}-${sequence}`;
};

module.exports = {
  generatePONumber,
};
