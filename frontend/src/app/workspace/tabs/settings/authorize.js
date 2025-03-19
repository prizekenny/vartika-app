import React, { useState, useEffect } from "react";
import { SiQuickbooks, SiGoogledrive } from "react-icons/si";
import { RiRobot2Fill } from "react-icons/ri";
import GmailCard from "./components/GmailCard";
import ServiceCard from "./components/ServiceCard";

const AuthorizeTab = () => {
  // Updated state to handle multiple Gmail accounts
  const [authorizedServices, setAuthorizedServices] = useState({
    gmail: {
      accounts: [],
    },
    googleDrive: {
      authorized: false,
      active: false,
      email: "",
    },
    quickbooks: {
      authorized: false,
      active: false,
      email: "",
    },
    karbonAI: {
      authorized: false,
      active: false,
    },
  });

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
      // Check QuickBooks status - use the existing endpoints
      await checkQuickbooksServiceAuthorization();
      
      // Add other services status fetching here as they're implemented
      
      // For now, using mock data for other services
      setAuthorizedServices((prev) => ({
        ...prev,
        gmail: {
          accounts: [
            { email: "user1@example.com", active: true },
            { email: "user2@example.com", active: false },
          ],
        },
        googleDrive: {
          authorized: true,
          active: true,
          email: "drive@example.com",
        },
        karbonAI: {
          authorized: false,  // Changed to false for testing
          active: false,
        },
      }));
    } catch (error) {
      console.error("Error fetching services status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check QuickBooks service authorization using the existing endpoints
  const checkQuickbooksServiceAuthorization = async () => {
    try {
      console.log("Checking QuickBooks authorization status...");
      
      // First check if the service is authorized using /quickbooks/authorized
      const authResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/quickbooks/authorized`, 
        { 
          credentials: "include",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache"
          }
        }
      );
      
      if (!authResponse.ok) {
        console.warn("Failed to check QuickBooks authorization status:", authResponse.status);
        return false;
      }
      
      const authData = await authResponse.json();
      console.log("QuickBooks authorized endpoint response:", authData);
      
      if (authData.authorized) {
        console.log("QuickBooks is authorized, checking authorized users...");
        
        // If authorized, get the list of authorized users using /quickbooks/authorized-users
        const usersResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/quickbooks/authorized-users`, 
          { 
            credentials: "include",
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate",
              "Pragma": "no-cache"
            }
          }
        );
        
        if (!usersResponse.ok) {
          console.warn("Failed to fetch authorized users:", usersResponse.status);
          return false;
        }
        
        const usersData = await usersResponse.json();
        console.log("QuickBooks authorized users response:", usersData);
        
        if (usersData.authorizedUsers && usersData.authorizedUsers.length > 0) {
          // We have at least one authorized user
          const firstUser = usersData.authorizedUsers[0];
          console.log("Found authorized QuickBooks user:", firstUser);
          
          setAuthorizedServices((prev) => ({
            ...prev,
            quickbooks: {
              authorized: true,
              active: true,
              email: firstUser.email || "Authorized User"
            },
          }));
          
          return true;
        } else {
          console.log("No authorized users found despite service being authorized");
        }
      } else {
        console.log("QuickBooks is not authorized");
        
        // Service is not authorized
        setAuthorizedServices((prev) => ({
          ...prev,
          quickbooks: {
            ...prev.quickbooks,
            authorized: false,
            active: false,
          },
        }));
      }
      return false;
    } catch (error) {
      console.error("Error checking QuickBooks service authorization:", error);
      // Don't update state on error, to prevent wiping out existing auth state
      return false;
    }
  };

  // Start OAuth flow for a service
  const handleAuthorize = async (service) => {
    try {
      console.log(`Starting authorization for ${service}...`);

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
            authorized = await checkQuickbooksServiceAuthorization();
          } else if (service === "gmail") {
            // TODO: Implement Gmail check via API
            // For now use mock data
            authorized = Math.random() > 0.7; // Simulate random success for testing
          } else if (service === "googleDrive") {
            // TODO: Implement Google Drive check via API
            authorized = Math.random() > 0.7; // Simulate random success for testing
          } else if (service === "karbonAI") {
            // TODO: Implement KarbonAI check via API
            authorized = Math.random() > 0.7; // Simulate random success for testing
          }
          
          if (authorized) {
            console.log(`✅ ${service} authorization successful via API!`);
            clearInterval(statusCheckInterval);
            
            // Update UI based on the service
            if (service === "gmail") {
              // For Gmail, add a mock new account
              const mockNewEmail = `new${Math.floor(Math.random() * 1000)}@gmail.com`;
              
              setAuthorizedServices((prev) => ({
                ...prev,
                gmail: {
                  ...prev.gmail,
                  accounts: [
                    ...prev.gmail.accounts,
                    { email: mockNewEmail, active: true },
                  ],
                },
              }));
            } else if (service !== "quickbooks") {
              // For other services (except QuickBooks which is already updated by the check function)
              setAuthorizedServices((prev) => ({
                ...prev,
                [service]: {
                  ...prev[service],
                  authorized: true,
                  active: true,
                  ...(service === "googleDrive" ? { email: "drive@example.com" } : {}),
                },
              }));
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
              console.log("Note: Could not close the auth window due to cross-origin restrictions");
            }
          }
        } catch (error) {
          console.error(`Error checking ${service} authorization status:`, error);
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
        setAuthorizedServices((prev) => ({
          ...prev,
          gmail: {
            ...prev.gmail,
            accounts: prev.gmail.accounts.filter(
              (account) => account.email !== email
            ),
          },
        }));
      } else {
        // For other services, just set authorized to false
        setAuthorizedServices((prev) => ({
          ...prev,
          [service]: {
            ...prev[service],
            authorized: false,
            active: false,
          },
        }));
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
            accounts={authorizedServices.gmail.accounts}
            isAuthInProgress={authInProgress.gmail}
            onAuthorize={handleAuthorize}
            onRevoke={handleRevoke}
          />

          <ServiceCard
            service="googleDrive"
            name="Google Drive"
            icon={<SiGoogledrive className="text-2xl text-blue-600" />}
            isAuthorized={authorizedServices.googleDrive.authorized}
            isActive={authorizedServices.googleDrive.active}
            isAuthInProgress={authInProgress.googleDrive}
            onAuthorize={handleAuthorize}
            onRevoke={handleRevoke}
            details={
              authorizedServices.googleDrive.authorized ? (
                <p>Connected account: {authorizedServices.googleDrive.email}</p>
              ) : (
                <p className="text-gray-500 italic">Not authorized</p>
              )
            }
          />

          <ServiceCard
            service="quickbooks"
            name="QuickBooks"
            icon={<SiQuickbooks className="text-2xl text-green-500" />}
            isAuthorized={authorizedServices.quickbooks.authorized}
            isActive={authorizedServices.quickbooks.active}
            isAuthInProgress={authInProgress.quickbooks}
            onAuthorize={handleAuthorize}
            onRevoke={handleRevoke}
            details={
              authorizedServices.quickbooks.authorized ? (
                <p>Connected account: {authorizedServices.quickbooks.email}</p>
              ) : (
                <p className="text-gray-500 italic">Not authorized</p>
              )
            }
          />

          <ServiceCard
            service="karbonAI"
            name="KarbonAI"
            icon={<RiRobot2Fill className="text-2xl text-purple-600" />}
            isAuthorized={authorizedServices.karbonAI.authorized}
            isActive={authorizedServices.karbonAI.active}
            isAuthInProgress={authInProgress.karbonAI}
            onAuthorize={handleAuthorize}
            onRevoke={handleRevoke}
            details={
              authorizedServices.karbonAI.authorized ? (
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
