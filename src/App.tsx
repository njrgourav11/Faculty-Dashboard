import { useEffect, useState } from 'react';
import { Route, Routes, useLocation, BrowserRouter } from 'react-router-dom';
import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';
import Calendar from './pages/Calendar';
import Chart from './pages/Chart';
import ECommerce from './pages/Dashboard/ECommerce';
import Notifications from './pages/Dashboard/Notifications';
import FormElements from './pages/Form/FormElements';
import FormLayout from './pages/Form/FormLayout';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Tables from './pages/Tables';
import Alerts from './pages/UiElements/Alerts';
import Buttons from './pages/UiElements/Buttons';
import DefaultLayout from './layout/DefaultLayout';
import PrivateRoute from './context/PrivateRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <AuthProvider>
      <DefaultLayout>
        <Routes>
          <Route path="/auth/signin" element={<SignIn />} />
          <Route path="/auth/signup" element={<SignUp />} />
          <Route element={<PrivateRoute />}>
            <Route
              path="/"
              element={
                <>
                  <PageTitle title="Faculty Dashboard | NIST - Faculty Admin Dashboard" />
                  <ECommerce />
                </>
              }
            />
            <Route
              path="/calendar"
              element={
                <>
                  <PageTitle title="Calendar | NIST - Faculty Admin Dashboard" />
                  <Calendar />
                </>
              }
            />
            <Route
              path="/notifications"
              element={
                <>
                  <PageTitle title="Notifications | NIST - Faculty Admin Dashboard" />
                  <Notifications />
                </>
              }
            />
            <Route
              path="/profile"
              element={
                <>
                  <PageTitle title="Profile | NIST - Faculty Admin Dashboard" />
                  <Profile />
                </>
              }
            />
            <Route
              path="/forms/form-elements"
              element={
                <>
                  <PageTitle title="Form Elements | NIST - Faculty Admin Dashboard" />
                  <FormElements />
                </>
              }
            />
            <Route
              path="/forms/form-layout"
              element={
                <>
                  <PageTitle title="Form Layout | NIST - Faculty Admin Dashboard" />
                  <FormLayout />
                </>
              }
            />
            <Route
              path="/tables"
              element={
                <>
                  <PageTitle title="Tables | NIST - Faculty Admin Dashboard" />
                  <Tables />
                </>
              }
            />
            <Route
              path="/settings"
              element={
                <>
                  <PageTitle title="Settings | NIST - Faculty Admin Dashboard" />
                  <Settings />
                </>
              }
            />
            <Route
              path="/chart"
              element={
                <>
                  <PageTitle title="Basic Chart | NIST - Faculty Admin Dashboard" />
                  <Chart />
                </>
              }
            />
            <Route
              path="/ui/alerts"
              element={
                <>
                  <PageTitle title="Alerts | NIST - Faculty Admin Dashboard" />
                  <Alerts />
                </>
              }
            />
            <Route
              path="/ui/buttons"
              element={
                <>
                  <PageTitle title="Buttons | NIST - Faculty Admin Dashboard" />
                  <Buttons />
                </>
              }
            />
          </Route>
        </Routes>
      </DefaultLayout>
    </AuthProvider>
  );
}

export default App;
