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
  const [customers, setCustomers] = useState<any[]>([]);

  const fetchCustomers = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("verifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching customers:", error);
    } else {
      setCustomers(data || []);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  console.log(customers);

  const form = useForm({
    initialValues: {
      name: "",
      phoneNumber: "",
      userData: "",
    },
    validate: {
      name: (value) => (value.trim().length > 0 ? null : "Name is required"),
      phoneNumber: (value) =>
        /^\d{10}$/.test(value) ? null : "Invalid phone number",
      userData: (value) => {
        try {
          JSON.parse(value);
          return null;
        } catch (error) {
          return "Invalid JSON";
        }
      },
    },
  });

  return (
    <>
      <div style={{ padding: "10px" }}>
        <div style={{ marginBottom: "20px" }}>
          <div className={styles.heading}>Verifications Call Logs</div>
          <div>View the status of calls made by your automated agent.</div>
        </div>

        <Collapsible
          trigger={
            <>
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
                }}
              >
                <div>Bardia Safari (ID: 123456)</div>
                <Badge color="teal" size="md">
                  Identity Verified
                </Badge>
              </div>
            </>
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
            }}
          >
            <div style={{ fontWeight: 800 }}>Call Summary</div>
          </div>
        </Collapsible>
      </div>
    </>
  );
}
