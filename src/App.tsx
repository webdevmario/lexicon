import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Shell from "@/components/Shell";
import DiscoverPage from "@/pages/DiscoverPage";
import SearchPage from "@/pages/SearchPage";
import SavedPage from "@/pages/SavedPage";
import PracticePage from "@/pages/PracticePage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Shell />}>
            <Route index element={<DiscoverPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="saved" element={<SavedPage />} />
            <Route path="practice" element={<PracticePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
