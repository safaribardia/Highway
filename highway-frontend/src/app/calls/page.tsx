"use client";
import CallButton from "@/components/CallButton";
import PhoneInput from "@/components/PhoneInput";
import { callCustomer } from "@/utils/api";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import "@mantine/core/styles.css";
import { Badge } from "@mantine/core";

import { createTheme } from "@mantine/core";
import styles from "../CustomTable.module.css";
import { useForm } from "@mantine/form";
import Collapsible from "react-collapsible";

const theme = createTheme({
  black: "#0c0d21",
  colors: {
    dark: [
      "#d5d7e0",
      "#acaebf",
      "#8c8fa3",
      "#666980",
      "#4d4f66",
      "#34354a",
      "#2b2c3d",
      "#1d1e30",
      "#0c0d21",
      "#01010a",
    ],
  },
  primaryColor: "dark",
});

export default function Page() {
  const [calls, setCalls] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<{ [key: string]: any }>(
    {}
  );

  const fetchData = async () => {
    const supabase = createClient();

    // Fetch calls
    const { data: callsData, error: callsError } = await supabase
      .from("calls")
      .select("*")
      .order("created_at", { ascending: false });

    if (callsError) {
      console.error("Error fetching calls:", callsError);
    } else {
      setCalls(callsData || []);

      // Get unique verification IDs
      const verificationIds = [
        ...new Set(callsData?.map((call) => call.verification)),
      ];

      // Fetch corresponding verifications
      const { data: verificationsData, error: verificationsError } =
        await supabase
          .from("verifications")
          .select("*")
          .in("id", verificationIds);

      if (verificationsError) {
        console.error("Error fetching verifications:", verificationsError);
      } else {
        // Create a map of verifications for easy lookup
        const verificationsMap = verificationsData?.reduce(
          (acc, verification) => {
            acc[verification.id] = verification;
            return acc;
          },
          {}
        );
        setVerifications(verificationsMap);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      user_hung_up: "red",
      system_error: "orange",
      unsuccessful_call: "yellow",
      successful_call: "teal",
      in_progress: "blue",
    };

    const statusLabels: { [key: string]: string } = {
      user_hung_up: "USER HUNG UP",
      system_error: "SYSTEM ERROR",
      unsuccessful_call: "IDENTITY NOT VERIFIED",
      successful_call: "IDENTITY VERIFIED",
      in_progress: "IN PROGRESS",
    };

    return (
      <Badge color={statusColors[status] || "gray"} size="md">
        {statusLabels[status] || status.replace(/_/g, " ").toUpperCase()}
      </Badge>
    );
  };

  return (
    <>
      <div style={{ padding: "10px" }}>
        <div style={{ marginBottom: "20px" }}>
          <div className={styles.heading}>Verifications Call Logs</div>
          <div>View the status of calls made by your automated agent.</div>
        </div>

        {calls.map((call) => {
          const verification = verifications[call.verification];
          return (
            <Collapsible
              key={call.id}
              trigger={
                <div
                  style={{
                    color: "white",
                    fontWeight: 800,
                    width: "80%",
                    backgroundColor: theme.colors?.dark?.[6],
                    borderRadius: "5px",
                    cursor: "pointer",
                    borderBottomRightRadius: 0,
                    borderBottomLeftRadius: 0,
                    minHeight: "70px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 20px",
                    marginBottom: "10px",
                  }}
                >
                  <div>
                    {verification?.name || "Unknown"} (ID: {call.id})
                  </div>
                  {getStatusBadge(call.status)}
                </div>
              }
              transitionTime={100}
            >
              <div
                style={{
                  color: "white",
                  fontWeight: 500,
                  padding: "20px 20px",
                  backgroundColor: theme.colors?.dark?.[4],
                  borderRadius: "5px",
                  borderTopRightRadius: 0,
                  borderTopLeftRadius: 0,
                  width: "80%",
                  marginBottom: "20px",
                }}
              >
                <div style={{ fontWeight: 800, marginBottom: "10px" }}>
                  Call Summary
                </div>
                <div>Phone: {verification?.phone || "N/A"}</div>
                <div>Status: {call.status}</div>
                <div>
                  Created At: {new Date(call.created_at).toLocaleString()}
                </div>
                <div style={{ marginTop: "10px", fontWeight: 800 }}>
                  Verification Data:
                </div>
                <pre
                  style={{
                    whiteSpace: "pre-wrap",
                    wordWrap: "break-word",
                    backgroundColor: theme.colors?.dark?.[5],
                    padding: "10px",
                    borderRadius: "5px",
                    marginTop: "5px",
                  }}
                >
                  {JSON.stringify(verification?.data, null, 2)}
                </pre>
              </div>
            </Collapsible>
          );
        })}
      </div>
    </>
  );
}
