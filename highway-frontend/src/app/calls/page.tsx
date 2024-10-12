"use client";
import CallButton from "@/components/CallButton";
import PhoneInput from "@/components/PhoneInput";
import { callCustomer } from "@/utils/api";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import "@mantine/core/styles.css";
import { Badge } from "@mantine/core";

import {
  createTheme,
  MantineProvider,
  AppShell,
  Burger,
  Button,
  Modal,
  Table,
  TextInput,
  Textarea,
  JsonInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
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
  const [phoneNumber, setPhoneNumber] = useState("");
  const [
    addUserModalOpened,
    { open: openAddUserModal, close: closeAddUserModal },
  ] = useDisclosure(false);
  const [callInProgress, setCallInProgress] = useState<{
    [key: number]: boolean;
  }>({});
  const [selectedUserData, setSelectedUserData] = useState<string | null>(null);
  const [dataModalOpened, { open: openDataModal, close: closeDataModal }] =
    useDisclosure(false);

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

  const handleCall = (customerId: number, phoneNumber: string) => {
    setCallInProgress((prev) => ({ ...prev, [customerId]: true }));
    callCustomer(`+1${phoneNumber.replace(/[^\d]/g, "")}`).finally(() => {
      setCallInProgress((prev) => ({ ...prev, [customerId]: false }));
    });
  };

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

  const handleSubmit = async (values: typeof form.values) => {
    const supabase = createClient();
    const { data, error } = await supabase.from("verifications").insert({
      name: values.name,
      phone: values.phoneNumber,
      data: JSON.parse(values.userData),
    });

    if (error) {
      console.error("Error adding verification:", error);
      // You might want to show an error message to the user here
    } else {
      console.log("Verification added successfully:", data);
      fetchCustomers(); // Refresh the customer list
      closeAddUserModal();
      form.reset(); // Reset the form
    }
  };

  const handleViewData = (userData: any) => {
    setSelectedUserData(JSON.stringify(userData, null, 2));
    openDataModal();
  };

  const modalStyles = {
    header: {
      backgroundColor: theme.colors?.dark?.[6],
      color: "white",
      padding: "20px",
    },
    body: {
      backgroundColor: theme.colors?.dark?.[5],
      color: "white",
      padding: "20px",
    },
    close: {
      color: theme.white,
      "&:hover": {
        backgroundColor: theme.colors?.dark?.[6],
      },
    },
  };

  return (
    <>
      <div style={{ padding: "10px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div className={styles.heading}>Verification Call Logs</div>
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
