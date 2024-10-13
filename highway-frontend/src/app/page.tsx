"use client";
import CallButton from "@/components/CallButton";
import PhoneInput from "@/components/PhoneInput";
import { callCustomer } from "@/utils/api";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import "@mantine/core/styles.css";
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
  Badge,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import styles from "./CustomTable.module.css";
import { useForm } from "@mantine/form";

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

  const statusTypes = {
    CALL_IN_PROGRESS: { color: "yellow", label: "CALL IN PROGRESS" },
    CALLED: { color: "teal", label: "CALLED" },
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
      <Modal
        opened={addUserModalOpened}
        onClose={closeAddUserModal}
        withCloseButton={false}
        title="Add Verification"
        centered
        size="md"
        styles={modalStyles}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Name"
            placeholder="Enter name"
            {...form.getInputProps("name")}
            required
            mb="md"
            styles={(theme) => ({
              input: {
                backgroundColor: theme.colors.dark[6],
                color: theme.white,
                border: `1px solid ${theme.colors.dark[4]}`,
                "&:focus": {
                  borderColor: theme.colors.blue[7],
                },
              },
              label: {
                color: theme.white,
                marginBottom: "5px",
              },
            })}
          />
          <TextInput
            label="Phone Number"
            placeholder="Enter 10-digit phone number"
            {...form.getInputProps("phoneNumber")}
            style={{ marginBottom: "10px" }}
            required
            styles={(theme) => ({
              input: {
                backgroundColor: theme.colors.dark[6],
                color: theme.colors.dark[0],
                border: 0,
              },
              label: {
                color: theme.colors.dark[0],
              },
            })}
          />
          <JsonInput
            label="Verification data (JSON)"
            placeholder="Enter verification data in JSON format"
            {...form.getInputProps("userData")}
            style={{ marginBottom: "10px" }}
            required
            validationError="Invalid JSON"
            formatOnBlur
            autosize
            minRows={4}
            styles={(theme) => ({
              input: {
                backgroundColor: theme.colors.dark[6],
                color: theme.colors.dark[0],
                border: 0,
              },
              label: {
                color: theme.colors.dark[0],
              },
            })}
          />
          <Button type="submit" fullWidth mt="xl" color="blue">
            Add verification
          </Button>
        </form>
      </Modal>

      <Modal
        opened={dataModalOpened}
        onClose={closeDataModal}
        title="Verification Data"
        centered
        size="lg"
        styles={modalStyles}
      >
        <div style={{ marginBottom: "10px" }}>
          The automated agent will inquire about the following data to verify
          the identity of the customer.
        </div>
        <pre
          style={{
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
            backgroundColor: theme.colors?.dark?.[7],
            padding: "15px",
            borderRadius: "5px",
            border: `1px solid ${theme.colors?.dark?.[5]}`,
          }}
        >
          {selectedUserData}
        </pre>
      </Modal>

      <div style={{ padding: "10px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div className={styles.heading}>Pending Verifications</div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Button variant="outline" color="white">
              Actions
            </Button>
            <Button variant="white" onClick={openAddUserModal}>
              Add verification
            </Button>
          </div>
        </div>
        <table className={styles.customTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Background</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <Badge
                      color={statusTypes["CALL_IN_PROGRESS"].color}
                      size="md"
                    >
                      {statusTypes["CALL_IN_PROGRESS"].label}
                    </Badge>
                    {customer.name}
                  </div>
                </td>
                <td>{customer.phone}</td>
                <td>{customer.type}</td>
                <td>
                  <div style={{ display: "flex", gap: 10 }}>
                    <Button
                      variant="outline"
                      color="white"
                      onClick={() => handleViewData(customer.data)}
                    >
                      Data
                    </Button>
                    <Button
                      variant="white"
                      loading={callInProgress[customer.id] || false}
                      onClick={() => handleCall(customer.id, customer.phone)}
                    >
                      Initiate call
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
