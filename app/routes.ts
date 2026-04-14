import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/login/login.tsx"),
  route("dashboard", "routes/home.tsx"),
  route("sendsms", "routes/sendsms/sendsms.tsx"),
  route("account", "routes/account/account.tsx"),
] satisfies RouteConfig;



// import { type RouteConfig, index } from "@react-router/dev/routes";
// export default [index("routes/home.tsx")] satisfies RouteConfig;
