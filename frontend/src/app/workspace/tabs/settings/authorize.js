import React, { useState, useEffect } from "react";
import { SiQuickbooks, SiGoogledrive } from "react-icons/si";
import { RiRobot2Fill } from "react-icons/ri";
import GmailCard from "./components/GmailCard";
import ServiceCard from "./components/ServiceCard";
import {
  getQuickBooksAuthStatus,
  resetQuickBooksAuthStatus,
  getQuickBooksAuthorizedUsers,
} from "@/api/quickbooks";
import {
  getGoogleDriveAuthStatus,
  resetGoogleDriveAuthStatus,
  getGoogleDriveAuthorizedUsers,
} from "@/api/googleDrive";

const AuthorizeTab = () => {
  // Updated individual states instead of a single object
  const [gmailAccounts, setGmailAccounts] = useState([]);
  const [googleDriveAuthorized, setGoogleDriveAuthorized] = useState(false);
  const [googleDriveEmail, setGoogleDriveEmail] = useState("");
  const [quickbooksAuthorized, setQuickbooksAuthorized] = useState(false);
  const [quickbooksEmail, setQuickbooksEmail] = useState("");
  const [karbonAIAuthorized, setKarbonAIAuthorized] = useState(false);

  const [authInProgress, setAuthInProgress] = useState({
    gmail: false,
    googleDrive: false,
    quickbooks: false,
    karbonAI: false,
  });

  const [isLoading, setIsLoading] = useState(true);

  // Fetch authorization status for all services on component mount
  useEffect(() => {
    fetchAllServicesStatus();
  }, []);

  // Fetch status of all services
  const fetchAllServicesStatus = async () => {
    setIsLoading(true);
    try {
      const users = await getQuickBooksAuthorizedUsers();
      if (users?.authorizedUsers?.length > 0) {
        setQuickbooksAuthorized(true);
        setQuickbooksEmail(users.authorizedUsers[0]);
      } else {
        setQuickbooksAuthorized(false);
        setQuickbooksEmail("");
      }

      // Mock data for others
      setGmailAccounts([
        { email: "vartika.portal@gmail.com", active: true },
        { email: "sunny.portal@gmail.com.com", active: false },
      ]);

      // Check Google Drive authorization status
      const driveUsers = await getGoogleDriveAuthorizedUsers();
      if (driveUsers?.authorizedUsers?.length > 0) {
        setGoogleDriveAuthorized(true);
        setGoogleDriveEmail(driveUsers.authorizedUsers[0]);
      } else {
        setGoogleDriveAuthorized(false);
        setGoogleDriveEmail("");
      }
      setKarbonAIAuthorized(false);
    } catch (error) {
      console.error("Error fetching services status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Start OAuth flow for a service
  const handleAuthorize = async (service) => {
    try {
      console.log(`Starting authorization for ${service}...`);

      if (service === "quickbooks") {
        await resetQuickBooksAuthStatus();
      }
      if (service === "googleDrive") {
        await resetGoogleDriveAuthStatus();
      }

      // Open OAuth window
      const authWindow = window.open(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/${service}`,
        "_blank",
        "width=500,height=600"
      );

      if (!authWindow) {
        console.error("Authorization window was blocked by the browser.");
        alert("Please allow popups for this site to authorize services.");
        return;
      }

      // Set auth in progress flag
      setAuthInProgress((prev) => ({
        ...prev,
        [service]: true,
      }));

      // Set up polling to check authorization status through API
      const statusCheckInterval = setInterval(async () => {
        try {
          let authorized = false;

          // Check authorization status via API calls
          if (service === "quickbooks") {
            // Use fetchAllServicesStatus to refresh state, but check status directly for polling
            const status = await getQuickBooksAuthStatus();
            if (status?.recentAuth) {
              const users = await getQuickBooksAuthorizedUsers();
              setQuickbooksAuthorized(true);
              setQuickbooksEmail(
                users?.authorizedUsers?.[0] || "Authorized User"
              );
              authorized = true;
            } else {
              setQuickbooksAuthorized(false);
              setQuickbooksEmail("");
              authorized = false;
            }
          } else if (service === "gmail") {
            // TODO: Implement Gmail check via API
            // For now use mock data
            authorized = Math.random() > 0.7; // Simulate random success for testing
          } else if (service === "googleDrive") {
            const driveStatus = await getGoogleDriveAuthStatus();
            if (driveStatus?.recentAuth) {
              const users = await getGoogleDriveAuthorizedUsers();
              setGoogleDriveAuthorized(true);
              setGoogleDriveEmail(
                users?.authorizedUsers?.[0] || "Authorized User"
              );
              authorized = true;
            } else {
              setGoogleDriveAuthorized(false);
              setGoogleDriveEmail("");
              authorized = false;
            }
          } else if (service === "karbonAI") {
            // TODO: Implement KarbonAI check via API
            authorized = Math.random() > 0.7; // Simulate random success for testing
          }

          if (authorized === true) {
            console.log(`✅ ${service} authorization successful via API!`);
            clearInterval(statusCheckInterval);

            // Update UI based on the service
            if (service === "gmail") {
              // For Gmail, add a mock new account
              const mockNewEmail = `new${Math.floor(
                Math.random() * 1000
              )}@gmail.com`;

              setGmailAccounts((prev) => [
                ...prev,
                { email: mockNewEmail, active: true },
              ]);
            } else if (service === "googleDrive") {
              setGoogleDriveAuthorized(true);
              setGoogleDriveEmail("drive@example.com");
            } else if (service === "karbonAI") {
              setKarbonAIAuthorized(true);
            }

            // Reset auth in progress flag
            setAuthInProgress((prev) => ({
              ...prev,
              [service]: false,
            }));

            // Close the window if it's still open
            try {
              if (authWindow && !authWindow.closed) {
                authWindow.close();
              }
            } catch (windowError) {
              console.log(
                "Note: Could not close the auth window due to cross-origin restrictions"
              );
            }
          }
        } catch (error) {
          console.error(
            `Error checking ${service} authorization status:`,
            error
          );
          clearInterval(statusCheckInterval);
          setAuthInProgress((prev) => ({
            ...prev,
            [service]: false,
          }));
        }
      }, 2000); // Poll every 2 seconds

      // Set a timeout to stop polling after 5 minutes (prevent infinite polling)
      setTimeout(() => {
        if (statusCheckInterval) {
          console.log(`Authorization timeout for ${service} after 5 minutes`);
          clearInterval(statusCheckInterval);
          setAuthInProgress((prev) => ({
            ...prev,
            [service]: false,
          }));
        }
      }, 5 * 60 * 1000);
    } catch (error) {
      console.error(`Error starting ${service} authorization:`, error);
      setAuthInProgress((prev) => ({
        ...prev,
        [service]: false,
      }));
    }
  };

  const handleRevoke = async (service, email = null) => {
    try {
      console.log(`Revoking ${service}${email ? ` for ${email}` : ""}...`);

      // TODO: Add actual API call to revoke access
      // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/${service}/revoke`, {
      //   method: 'POST',
      //   credentials: 'include',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });

      // For Gmail we need to handle multiple accounts
      if (service === "gmail" && email) {
        setGmailAccounts((prev) =>
          prev.filter((account) => account.email !== email)
        );
      } else if (service === "googleDrive") {
        setGoogleDriveAuthorized(false);
        setGoogleDriveEmail("");
      } else if (service === "quickbooks") {
        setQuickbooksAuthorized(false);
        setQuickbooksEmail("");
      } else if (service === "karbonAI") {
        setKarbonAIAuthorized(false);
      }
    } catch (error) {
      console.error(`Error revoking ${service}:`, error);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-6">Manage Authorized Services</h3>
      <p className="mb-6 text-gray-600">
        Connect your accounts to enable seamless integration with external
        services.
      </p>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading authorization status...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <GmailCard
            accounts={gmailAccounts}
            isAuthInProgress={authInProgress.gmail}
            onAuthorize={handleAuthorize}
            onRevoke={handleRevoke}
          />

          <ServiceCard
            service="googleDrive"
            name="Google Drive"
            icon={<SiGoogledrive className="text-2xl text-blue-600" />}
            isAuthorized={googleDriveAuthorized}
            isActive={googleDriveAuthorized}
            isAuthInProgress={authInProgress.googleDrive}
            onAuthorize={handleAuthorize}
            onRevoke={handleRevoke}
            details={
              googleDriveAuthorized ? (
                <p>Connected account: {googleDriveEmail}</p>
              ) : (
                <p className="text-gray-500 italic">Not authorized</p>
              )
            }
          />

          <ServiceCard
            service="quickbooks"
            name="QuickBooks"
            icon={<SiQuickbooks className="text-2xl text-green-500" />}
            isAuthorized={quickbooksAuthorized}
            isActive={quickbooksAuthorized}
            isAuthInProgress={authInProgress.quickbooks}
            onAuthorize={handleAuthorize}
            onRevoke={handleRevoke}
            details={
              quickbooksAuthorized ? (
                <p>Connected account: {quickbooksEmail}</p>
              ) : (
                <p className="text-gray-500 italic">Not authorized</p>
              )
            }
          />

          <ServiceCard
            service="karbonAI"
            name="KarbonAI"
            icon={<RiRobot2Fill className="text-2xl text-purple-600" />}
            isAuthorized={karbonAIAuthorized}
            isActive={karbonAIAuthorized}
            isAuthInProgress={authInProgress.karbonAI}
            onAuthorize={handleAuthorize}
            onRevoke={handleRevoke}
            details={
              karbonAIAuthorized ? (
                <p>Connected AI service</p>
              ) : (
                <p className="text-gray-500 italic">Not authorized</p>
              )
            }
          />
        </div>
      )}
    </div>
  );
};

export default AuthorizeTab;
