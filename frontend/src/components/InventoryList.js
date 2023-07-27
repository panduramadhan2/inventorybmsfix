import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
// import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// import { saveAs } from "file-saver";
import ExcelJS from "exceljs";

import Login from "./Login/Login";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { firebaseConfig } from "../firebase/firebaseConfig";

const InventoryList = () => {
  const [inventories, setInventories] = useState([]);
  const [search, setSearch] = useState("");

  const [user, setUser] = useState(null); // Track the authenticated user

  // useEffect(() => {
  //   getInventory();
  // }, []);

  // const firebaseConfig = {
  //   apiKey: "AIzaSyCl3jNIWOxtdirgrtbmFL00W4-56cMmksc",
  //   authDomain: "inventorybms.firebaseapp.com",
  //   projectId: "inventorybms",
  //   storageBucket: "inventorybms.appspot.com",
  //   messagingSenderId: "810547387289",
  //   appId: "1:810547387289:web:45c3a7ff14ecc807a19108",
  // };

  useEffect(() => {
    // Initialize Firebase (Make sure to replace 'firebaseConfig' with your actual config object)
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    // Add a listener to detect the user's authentication state
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // User is signed in
        setUser(user);
        getInventory();
      } else {
        // User is signed out
        setUser(null);
      }
    });

    return () => unsubscribe(); // Clean up the listener when the component unmounts
  }, []);

  const handleLogout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        // Logout successful, do any additional cleanup or actions if needed
      })
      .catch((error) => {
        console.error("Logout error:", error);
        // Handle logout error if any
      });
  };

  async function getInventory() {
    try {
      const response = await axios.get("http://127.0.0.1:5000/inventories");
      setInventories(response.data);
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  const deleteInventory = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/inventories/${id}`);
      // setInventories();
      setInventories((prevInventories) =>
        prevInventories.filter((item) => item._id !== id)
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleExportData = async () => {
    try {
      // Fetch the data from the server
      const response = await axios.get("http://127.0.0.1:5000/inventories");

      // Create a new workbook and worksheet using ExcelJS
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Inventory Data");

      // Define the columns and set the header row
      const columns = [
        { header: "No", key: "_id" },
        { header: "No.Asset", key: "noAsset" },
        { header: "Merk", key: "merk" },
        { header: "Type", key: "type" },
        { header: "Serial Number", key: "serialNumber" },
        { header: "Pengguna", key: "pengguna" },
        { header: "Lokasi Terbaru", key: "lokasiTerbaru" },
        { header: "Kondisi", key: "kondisi" },
        { header: "Mouse", key: "mouse" },
        { header: "Mousepad", key: "mousepad" },
        { header: "Headset", key: "headset" },
        { header: "Keterangan", key: "keterangan" },
      ];
      worksheet.columns = columns;

      // Add the data rows to the worksheet
      response.data.forEach((inventory) => {
        worksheet.addRow(inventory);
      });

      // Set the response content type and headers
      const contentDisposition = `attachment; filename="inventory_data.xlsx"`;
      const contentType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      const buffer = await workbook.xlsx.writeBuffer();

      // Create a Blob with the Excel data
      const blob = new Blob([buffer], { type: contentType });

      // Create a link and click it to trigger the download
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = "inventory_data.xlsx";
      downloadLink.click();
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) {
    return <Login />;
  }

  return (
    <div className="container">
      <button
        onClick={handleLogout}
        className="button is-danger"
        style={{ float: "right", margin: "2%" }}
      >
        Logout
      </button>
      <Link to="add" className="button is-success" style={{ marginTop: "2%" }}>
        Add New
      </Link>

      <div
        style={{
          border: "1px solid black",
          borderRadius: "10px",
          paddingLeft: "10px",
          width: "300px",
          marginTop: "20px",
          boxShadow: "0 2px 4px rgba(1, 0, 0, 0.4)",
        }}
      >
        <InputGroup className="my-3" style={{ flexDirection: "row" }}>
          {/* Search icon inside the InputGroup */}

          {/* <Form.Control style={{marginRight: "-1rem"}} */}
          <InputGroup.Text
          // style={{  right: "-12rem", pointerEvents: "none" }}
          >
            <i className="bi bi-search"></i>
          </InputGroup.Text>
          <Form.Control
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search data Inventory"
            style={{ border: "none", padding: "8px", margin: "0" }}
          />
        </InputGroup>
      </div>

      <button
        onClick={handleExportData}
        className="button is-primary"
        style={{ marginTop: "2%" }}
      >
        Export Data
      </button>

      <div className="table-container" style={{ overflowX: "auto" }}>
        <div
          style={{
            maxWidth: "1000px", // Initial maximum width for larger screens
            /* Add the media query for smaller screens */
            "@media (max-width: 768px)": {
              maxWidth: "500px", // Maximum width for screens with max width of 768px or smaller
            },
          }}
        >
          <table
            className="table is-striped is-narrow mt-2"
            // style={{ tableLayout: "auto" }}
            style={{ tableLayout: "auto", fontSize: "0.8em" }}
          >
            <thead>
              <tr>
                <th>No</th>
                <th>No.Asset</th>
                <th>Merk</th>
                <th>Type</th>
                <th>Serial Number</th>
                <th>Pengguna</th>
                <th>Lokasi Terbaru</th>
                <th>Kondisi</th>
                <th>Mouse</th>
                <th>Mousepad</th>
                <th>Headset</th>
                <th>Keterangan</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventories
                .filter((inventory) => {
                  const searchQuery = search.toLowerCase();

                  if (searchQuery === "") {
                    return true; // If the search query is empty, show all inventories
                  } else {
                    return (
                      inventory.noAsset.toLowerCase().includes(searchQuery) ||
                      inventory.merk.toLowerCase().includes(searchQuery) ||
                      inventory.type.toLowerCase().includes(searchQuery) ||
                      inventory.serialNumber
                        .toLowerCase()
                        .includes(searchQuery) ||
                      inventory.pengguna.toLowerCase().includes(searchQuery) ||
                      inventory.lokasiTerbaru
                        .toLowerCase()
                        .includes(searchQuery) ||
                      inventory.kondisi.toLowerCase().includes(searchQuery) ||
                      inventory.mouse.toLowerCase().includes(searchQuery) ||
                      inventory.mousepad.toLowerCase().includes(searchQuery) ||
                      inventory.headset.toLowerCase().includes(searchQuery) ||
                      inventory.keterangan.toLowerCase().includes(searchQuery)
                    );
                  }
                })
                .map((inventories, index) => (
                  // {inventories.map((inventories, index) => (
                  <tr key={inventories._id}>
                    <td>{index + 1}</td>
                    <td>{inventories.noAsset}</td>
                    <td>{inventories.merk}</td>
                    <td>{inventories.type}</td>
                    <td>{inventories.serialNumber}</td>
                    <td>{inventories.pengguna}</td>
                    <td>{inventories.lokasiTerbaru}</td>
                    <td>{inventories.kondisi}</td>
                    <td>{inventories.mouse}</td>
                    <td>{inventories.mousepad}</td>
                    <td>{inventories.headset}</td>
                    <td>{inventories.keterangan}</td>
                    <td>
                      <Link
                        to={`edit/${inventories._id}`}
                        className="button is-info is-small"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => deleteInventory(inventories._id)}
                        className="button is-danger is-small"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryList;
