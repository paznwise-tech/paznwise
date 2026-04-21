const { PrismaClient, AuthProvider, UserRole } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...\n');

  // ─────────────────────────────────────────────
  // CLEAN UP (order matters due to FK constraints)
  // ─────────────────────────────────────────────
  await prisma.otpVerification.deleteMany();
  await prisma.session.deleteMany();
  await prisma.socialAccount.deleteMany();
  await prisma.user.deleteMany();
  console.log('🧹 Cleaned existing data\n');

  // ─────────────────────────────────────────────
  // HASH PASSWORDS
  // ─────────────────────────────────────────────
  const defaultPassword = await bcrypt.hash('Password@123', 10);

  // ─────────────────────────────────────────────
  // CREATE USERS
  // ─────────────────────────────────────────────
  const usersData = [
    // ADMIN
    {
      email: 'admin@paznwise.com',
      phone: '+919000000001',
      passwordHash: defaultPassword,
      provider: AuthProvider.EMAIL,
      role: UserRole.ADMIN,
      isVerified: true,
      isActive: true,
    },
    // ARTIST
    {
      email: 'artist.ravi@paznwise.com',
      phone: '+919000000002',
      passwordHash: defaultPassword,
      provider: AuthProvider.EMAIL,
      role: UserRole.ARTIST,
      isVerified: true,
      isActive: true,
    },
    {
      email: 'artist.priya@paznwise.com',
      phone: '+919000000003',
      passwordHash: defaultPassword,
      provider: AuthProvider.GOOGLE,
      role: UserRole.ARTIST,
      isVerified: true,
      isActive: true,
    },
    // BUYER
    {
      email: 'buyer.amit@paznwise.com',
      phone: '+919000000004',
      passwordHash: defaultPassword,
      provider: AuthProvider.EMAIL,
      role: UserRole.BUYER,
      isVerified: true,
      isActive: true,
    },
    {
      email: 'buyer.sara@paznwise.com',
      phone: '+919000000005',
      passwordHash: defaultPassword,
      provider: AuthProvider.FACEBOOK,
      role: UserRole.BUYER,
      isVerified: false,
      isActive: true,
    },
    // BUYER via OTP (no email — phone-first)
    {
      email: null,
      phone: '+919000000006',
      passwordHash: null,
      provider: AuthProvider.OTP,
      role: UserRole.BUYER,
      isVerified: true,
      isActive: true,
    },
    // ORGANIZER
    {
      email: 'organizer.raj@paznwise.com',
      phone: '+919000000007',
      passwordHash: defaultPassword,
      provider: AuthProvider.EMAIL,
      role: UserRole.ORGANIZER,
      isVerified: true,
      isActive: true,
    },
    {
      email: 'organizer.nisha@paznwise.com',
      phone: '+919000000008',
      passwordHash: defaultPassword,
      provider: AuthProvider.GOOGLE,
      role: UserRole.ORGANIZER,
      isVerified: true,
      isActive: false, // inactive account
    },
  ];

  const users = [];
  for (const data of usersData) {
    const user = await prisma.user.create({ data });
    users.push(user);
    console.log(`✅ Created user [${user.role}]: ${user.email || user.phone}`);
  }

  // ─────────────────────────────────────────────
  // SOCIAL ACCOUNTS
  // ─────────────────────────────────────────────
  const socialData = [
    {
      userId: users[2].id, // artist.priya (Google)
      provider: AuthProvider.GOOGLE,
      providerId: 'google_uid_priya_1234567890',
      email: 'artist.priya@gmail.com',
    },
    {
      userId: users[4].id, // buyer.sara (Facebook)
      provider: AuthProvider.FACEBOOK,
      providerId: 'fb_uid_sara_9876543210',
      email: 'buyer.sara@facebook.com',
    },
    {
      userId: users[7].id, // organizer.nisha (Google)
      provider: AuthProvider.GOOGLE,
      providerId: 'google_uid_nisha_1122334455',
      email: 'organizer.nisha@gmail.com',
    },
  ];

  for (const data of socialData) {
    await prisma.socialAccount.create({ data });
    console.log(`🔗 Linked social account [${data.provider}] for userId: ${data.userId}`);
  }

  // ─────────────────────────────────────────────
  // SESSIONS (Refresh Tokens)
  // ─────────────────────────────────────────────
  const now = new Date();
  const future = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const expired = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000); // 1 day ago (expired)

  const sessionsData = [
    {
      userId: users[0].id, // admin
      refreshToken: 'rt_admin_mock_token_aabbccdd1122',
      deviceInfo: { platform: 'web', browser: 'Chrome', os: 'Windows 11' },
      ipAddress: '192.168.1.10',
      expiresAt: future,
    },
    {
      userId: users[1].id, // artist.ravi
      refreshToken: 'rt_artist_ravi_mock_token_eeff3344',
      deviceInfo: { platform: 'mobile', browser: 'Safari', os: 'iOS 17' },
      ipAddress: '10.0.0.21',
      expiresAt: future,
    },
    {
      userId: users[3].id, // buyer.amit
      refreshToken: 'rt_buyer_amit_mock_token_gghh5566',
      deviceInfo: { platform: 'web', browser: 'Firefox', os: 'macOS 14' },
      ipAddress: '172.16.0.5',
      expiresAt: future,
    },
    {
      userId: users[3].id, // buyer.amit — second session (multi-device)
      refreshToken: 'rt_buyer_amit_mobile_token_iijj7788',
      deviceInfo: { platform: 'mobile', browser: 'Chrome Mobile', os: 'Android 14' },
      ipAddress: '172.16.0.6',
      expiresAt: expired, // expired session
    },
    {
      userId: users[6].id, // organizer.raj
      refreshToken: 'rt_organizer_raj_mock_token_kkll9900',
      deviceInfo: { platform: 'web', browser: 'Edge', os: 'Windows 10' },
      ipAddress: '192.168.5.55',
      expiresAt: future,
    },
  ];

  for (const data of sessionsData) {
    await prisma.session.create({ data });
    console.log(`🔐 Created session for userId: ${data.userId} | Expires: ${data.expiresAt.toISOString()}`);
  }

  // ─────────────────────────────────────────────
  // OTP VERIFICATIONS
  // ─────────────────────────────────────────────
  const otpHash = await bcrypt.hash('123456', 10); // dummy OTP

  const otpData = [
    {
      userId: users[5].id, // OTP-based buyer
      phone: '+919000000006',
      otpHash,
      attempts: 0,
      expiresAt: future,
      verifiedAt: new Date(), // already verified
    },
    {
      userId: users[3].id, // buyer.amit requested OTP
      phone: '+919000000004',
      otpHash,
      attempts: 1,
      expiresAt: future,
      verifiedAt: null, // pending
    },
    {
      userId: null, // guest — not yet a user
      phone: '+919000000099',
      otpHash,
      attempts: 3,
      expiresAt: expired, // expired
      verifiedAt: null,
    },
  ];

  for (const data of otpData) {
    await prisma.otpVerification.create({ data });
    console.log(`📱 Created OTP record for phone: ${data.phone}`);
  }

  console.log('\n🎉 Seeding complete!');
  console.log(`   Users      : ${users.length}`);
  console.log(`   Social Accs: ${socialData.length}`);
  console.log(`   Sessions   : ${sessionsData.length}`);
  console.log(`   OTP Records: ${otpData.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
