import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { store, persistor } from '@/shared/store';
import { queryClient } from '@/shared/services/queryClient';
import { ThemeProvider } from '@/shared/theme';
import { AuthGate } from '@/app/layouts/AuthGate';
import { AuthBootstrap } from '@/app/layouts/AuthBootstrap';
import { AuthLayout } from '@/app/layouts/AuthLayout';
import { AppShell } from '@/app/layouts/AppShell';
import { TabLayout } from '@/app/layouts/TabLayout';
import { LoginPage } from '@/features/auth/screens/LoginPage';
import { RegisterPage } from '@/features/auth/screens/RegisterPage';
import { ForgotPasswordPage } from '@/features/auth/screens/ForgotPasswordPage';
import { ResetPasswordPage } from '@/features/auth/screens/ResetPasswordPage';
import { OtpLoginPage } from '@/features/auth/screens/OtpLoginPage';
import { VerifyEmailPage } from '@/features/auth/screens/VerifyEmailPage';
import { OnboardingPage } from '@/features/onboarding/screens/OnboardingPage';
import { DashboardPage } from '@/features/dashboard/screens/DashboardPage';
import { ExpensesPage } from '@/features/expenses/screens/ExpensesPage';
import { AddExpensePage } from '@/features/expenses/screens/AddExpensePage';
import { ExpenseDetailPage } from '@/features/expenses/screens/ExpenseDetailPage';
import { BudgetsPage } from '@/features/budgets/screens/BudgetsPage';
import { AddBudgetPage } from '@/features/budgets/screens/AddBudgetPage';
import { BudgetDetailPage } from '@/features/budgets/screens/BudgetDetailPage';
import { GoalsPage } from '@/features/goals/screens/GoalsPage';
import { AddGoalPage } from '@/features/goals/screens/AddGoalPage';
import { GoalDetailPage } from '@/features/goals/screens/GoalDetailPage';
import { ContributeGoalPage } from '@/features/goals/screens/ContributeGoalPage';
import { SettingsPage } from '@/features/settings/screens/SettingsPage';
import { IncomePage } from '@/features/income/screens/IncomePage';
import { AddIncomePage } from '@/features/income/screens/AddIncomePage';
import { IncomeDetailPage } from '@/features/income/screens/IncomeDetailPage';
import { AiCoachPage } from '@/features/ai/screens/AiCoachPage';
import { NetWorthPage } from '@/features/net-worth/screens/NetWorthPage';
import { CategoriesPage } from '@/features/categories/screens/CategoriesPage';
import { AccountsPage } from '@/features/accounts/screens/AccountsPage';
import { InvestmentsPage } from '@/features/investments/screens/InvestmentsPage';
import { SearchPage } from '@/features/search/screens/SearchPage';
import { ReportsPage } from '@/features/reports/screens/ReportsPage';
import { FamilyPage } from '@/features/family/screens/FamilyPage';
import { IntegrationsPage } from '@/features/integrations/screens/IntegrationsPage';
import { NotificationsPage } from '@/features/notifications/screens/NotificationsPage';
import { SupportPage } from '@/features/support/screens/SupportPage';
import { SubscriptionPage } from '@/features/subscription/screens/SubscriptionPage';
import { PrivacyPage, TermsPage } from '@/features/legal/screens/LegalPages';

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthBootstrap>
              <BrowserRouter>
                <Routes>
                  <Route element={<AuthGate />}>
                    <Route element={<AuthLayout />}>
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                      <Route path="/reset-password" element={<ResetPasswordPage />} />
                      <Route path="/otp-login" element={<OtpLoginPage />} />
                      <Route path="/verify-email" element={<VerifyEmailPage />} />
                    </Route>

                    <Route element={<AppShell />}>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/onboarding" element={<OnboardingPage />} />

                      <Route element={<TabLayout />}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/expenses" element={<ExpensesPage />} />
                        <Route path="/budgets" element={<BudgetsPage />} />
                        <Route path="/goals" element={<GoalsPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/income" element={<IncomePage />} />
                        <Route path="/ai" element={<AiCoachPage />} />
                      </Route>

                      <Route path="/expense/add" element={<AddExpensePage />} />
                      <Route path="/expense/:id" element={<ExpenseDetailPage />} />
                      <Route path="/income/add" element={<AddIncomePage />} />
                      <Route path="/income/:id" element={<IncomeDetailPage />} />
                      <Route path="/budget/add" element={<AddBudgetPage />} />
                      <Route path="/budget/:id" element={<BudgetDetailPage />} />
                      <Route path="/goal/add" element={<AddGoalPage />} />
                      <Route path="/goal/:id" element={<GoalDetailPage />} />
                      <Route path="/goal/:id/contribute" element={<ContributeGoalPage />} />
                      <Route path="/net-worth" element={<NetWorthPage />} />
                      <Route path="/categories" element={<CategoriesPage />} />
                      <Route path="/accounts" element={<AccountsPage />} />
                      <Route path="/investments" element={<InvestmentsPage />} />
                      <Route path="/search" element={<SearchPage />} />
                      <Route path="/reports" element={<ReportsPage />} />
                      <Route path="/family" element={<FamilyPage />} />
                      <Route path="/integrations" element={<IntegrationsPage />} />
                      <Route path="/notifications" element={<NotificationsPage />} />
                      <Route path="/support" element={<SupportPage />} />
                      <Route path="/subscription" element={<SubscriptionPage />} />
                      <Route path="/privacy" element={<PrivacyPage />} />
                      <Route path="/terms" element={<TermsPage />} />
                      <Route path="*" element={<div>Not Found</div>} />
                    </Route>
                  </Route>
                </Routes>
              </BrowserRouter>
            </AuthBootstrap>
          </ThemeProvider>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}
