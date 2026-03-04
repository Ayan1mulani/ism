export default ({ config }) => {
  const brand = process.env.APP_BRAND || "jaypee";

  let appName = "Jaypee Helpdesk";
  let packageName = "com.yourcompany.jaypee";

  if (brand === "enviro") {
    appName = "Enviro Plus";
    packageName = "com.yourcompany.enviro";
  }

  if (brand === "isociety") {
    appName = "iSocietyManager";
    packageName = "com.yourcompany.isociety";
  }

  return {
    ...config,
    name: appName,
    slug: brand,
    android: {
      ...config.android,
      package: packageName,
    },

    // 🔥 ADD THIS PART
    extra: {
      APP_BRAND: brand,
    },
  };
};