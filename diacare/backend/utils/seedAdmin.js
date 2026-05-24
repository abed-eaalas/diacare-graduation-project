const User = require('../models/User');

const seedAdmin = async () => {
  const adminEmail = 'admin123@gmail.com';
  const adminPassword = 'admin123';

  const existing = await User.findOne({ email: adminEmail });
  if (existing) {
    return { created: false };
  }

  const user = await User.create({
    name: 'Admin',
    email: adminEmail,
    password: adminPassword,
  });

  return { created: true, userId: user._id };
};

module.exports = seedAdmin;
