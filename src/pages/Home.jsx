import * as React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import { createTheme } from "@mui/material/styles";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { DemoProvider, useDemoRouter } from "@toolpad/core/internal";
import { useAuth } from "../contexts/AuthContext";
import { AccountBalance, Article, AttachMoney, Dashboard, People, Rule, Settings } from "@mui/icons-material";
import SoldesPage from "./SoldesPage";
import PensionsPage from "./PensionsPages";
import ParametresPage from "./ParametresPage";
import ServicesPage from "./ServicesPage";
import ArticlesPage from "./ArticlesPage";


const NAVIGATION = [
  { segment: "soldes", title: "Soldes", icon: <AttachMoney /> },
  { segment: "pensions", title: "Pensions", icon: <AccountBalance /> },
  { segment: "parametres", title: "Paramètres", icon: <Settings /> },
  { segment: "articles", title: "Articles", icon:  <Article/> },
  { segment: "services", title: "Services", icon: <People /> },
];


const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: "data-toolpad-color-scheme",
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

function DemoPageContent({ pathname, user }) {
  console.log(pathname)
  return (
    <Box sx={{ p: 2 }}>
      {pathname === "/soldes" && <SoldesPage user={user} />}
      {pathname === "/pensions" && <PensionsPage user={user} />}
      {pathname === "/services" && <ServicesPage user={user} />}
      {pathname === "/articles" && <ArticlesPage user={user} />}
      {pathname === "/parametres" && <ParametresPage user={user} />}
    </Box>
  );
}

DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
  user: PropTypes.object,
};

function DashboardLayoutAccount(props) {
  const { window } = props;
  const { user } = useAuth(); // <-- récupération de l'utilisateur depuis le contexte

  const router = useDemoRouter("/dashboard");
  const demoWindow = window !== undefined ? window() : undefined;

  return (
    <DemoProvider window={demoWindow}>
      <AppProvider
        session={{ user }}
        authentication={{}}
        navigation={NAVIGATION}
        router={router}
        theme={demoTheme}
        window={demoWindow}
      >
        <DashboardLayout>
          <DemoPageContent pathname={router.pathname} user={user} />
        </DashboardLayout>
      </AppProvider>
    </DemoProvider>
  );
}

export default DashboardLayoutAccount;
