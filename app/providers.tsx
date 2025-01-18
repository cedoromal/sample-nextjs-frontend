"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Configuration } from "@/openapi";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

const queryClient = new QueryClient();

const defaultClientApiConfig = new Configuration({
  basePath: typeof window !== "undefined" ? window.location.origin : undefined,
});

export const ApiContext = React.createContext({
  apiConfig: defaultClientApiConfig,
  setApiConfig: (_apiConfig: Configuration) => {},
});

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  const [apiConfig, setApiConfig] = React.useState(defaultClientApiConfig);

  return (
    <QueryClientProvider client={queryClient}>
      <ApiContext.Provider
        value={{
          apiConfig: apiConfig,
          setApiConfig: (apiConfig: Configuration) => setApiConfig(apiConfig),
        }}
      >
        <HeroUIProvider navigate={router.push}>
          <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
        </HeroUIProvider>
      </ApiContext.Provider>
    </QueryClientProvider>
  );
}
