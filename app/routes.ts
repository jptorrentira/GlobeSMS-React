import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  // Home page
  index("routes/home.tsx"),

  // Send sms page
  route("sendsms", "routes/sendsms/sendsms.tsx"),
] satisfies RouteConfig;



// import { type RouteConfig, index } from "@react-router/dev/routes";
// export default [index("routes/home.tsx")] satisfies RouteConfig;
