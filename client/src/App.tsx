import { AppLayout } from "@/pages/Layout";
import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/utils/wallet/config/WalletConfig";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import TelegramConnect from "./pages/TelegramConnect";
import Assets from "./pages/Assets";
import Dashboard from "./pages/Dashboard";

function App() {
  const client = new QueryClient();

  return (
    <>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={client}>
          <BrowserRouter>
            <AppLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/assets" element={<Assets />} />
                <Route path="/connect-telegram" element={<TelegramConnect />} />
              </Routes>
            </AppLayout>
          </BrowserRouter>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  );
}

export default App;
