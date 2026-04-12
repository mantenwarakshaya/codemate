// import React, { Component } from "react";
// import { useNavigate } from "react-router-dom";
// import Header from "../Header";
// import RequestCard from "./RequestCard";
// import "./index.css";

// import { LoaderView, ErrorView, EmptyView } from "../Common";

// const BASE_URL = import.meta.env.VITE_API_URL;

// const apiStatusConstants = {
//   initial: "INITIAL",
//   success: "SUCCESS",
//   failure: "FAILURE",
//   inProgress: "IN_PROGRESS",
// };

// class Requests extends Component {
//   // Initialize state replacing useState hooks
//   state = {
//     requests: [],
//     apiStatus: apiStatusConstants.initial,
//   };

//   // Replaces useEffect(() => { ... }, [])
//   componentDidMount() {
//     this.fetchRequests();
//   }

//   fetchRequests = async () => {
//     this.setState({ apiStatus: apiStatusConstants.inProgress });

//     try {
//       const res = await fetch(`${BASE_URL}/user/requests/received`, {
//         credentials: "include",
//       });

//       if (!res.ok) throw new Error("Failed to fetch requests");

//       const data = await res.json();

//       const formattedData = (data.data || []).map((req) => ({
//         _id: req._id,
//         fromUser: req.fromUserId,
//       }));

//       this.setState({
//         requests: formattedData,
//         apiStatus: apiStatusConstants.success,
//       });
//     } catch (err) {
//       console.error("Error fetching requests:", err);
//       this.setState({ apiStatus: apiStatusConstants.failure });
//     }
//   };

//   handleRequest = async (requestId, status) => {
//     try {
//       const res = await fetch(
//         `${BASE_URL}/request/review/${status}/${requestId}`,
//         {
//           method: "POST",
//           credentials: "include",
//         }
//       );

//       if (!res.ok) throw new Error("Failed to update request");

//       // Update state by filtering out the handled request
//       this.setState((prevState) => ({
//         requests: prevState.requests.filter((req) => req._id !== requestId),
//       }));
//     } catch (err) {
//       console.error("Error updating request:", err);
//     }
//   };

//   // 🟢 SUCCESS VIEW
//   renderSuccessView = () => {
//     const { requests } = this.state;
//     const { navigate } = this.props; // Access navigate from props

//     if (requests.length === 0) {
//       return (
//         <EmptyView
//           message="No pending requests."
//           actionText="Explore Feed"
//           onAction={() => navigate("/")}
//         />
//       );
//     }

//     return (
//       <div className="content-wrapper">
//         <div className="header">
//           <h1 className="title">Connection Requests</h1>
//           <span className="badge">{requests.length}</span>
//         </div>

//         {requests.map((req) => (
//           <RequestCard
//             key={req._id}
//             request={req}
//             onAction={this.handleRequest}
//           />
//         ))}
//       </div>
//     );
//   };

//   // 🎯 MAIN SWITCH
//   renderRequests = () => {
//     const { apiStatus } = this.state;

//     switch (apiStatus) {
//       case apiStatusConstants.inProgress:
//         return <LoaderView />;

//       case apiStatusConstants.failure:
//         return (
//           <ErrorView
//             message="Failed to load requests"
//             onRetry={this.fetchRequests}
//           />
//         );

//       case apiStatusConstants.success:
//         return this.renderSuccessView();

//       default:
//         return null;
//     }
//   };

//   render() {
//     return (
//       <>
//         <Header />
//         <div className="page-container">{this.renderRequests()}</div>
//       </>
//     );
//   }
// }

// // HOC Wrapper to allow use of useNavigate in a Class Component
// const RequestsWithNavigate = (props) => {
//   const navigate = useNavigate();
//   return <Requests {...props} navigate={navigate} />;
// };

// export default RequestsWithNavigate;


import React, { Component } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Header";
import RequestCard from "./RequestCard";
import "./index.css";

import { LoaderView, ErrorView, EmptyView } from "../Common";

const BASE_URL =
  location.hostname === "localhost"
    ? "http://localhost:7777"
    : "";

const apiStatusConstants = {
  initial: "INITIAL",
  success: "SUCCESS",
  failure: "FAILURE",
  inProgress: "IN_PROGRESS",
};

class Requests extends Component {
  // Initialize state replacing useState hooks
  state = {
    requests: [],
    apiStatus: apiStatusConstants.initial,
  };

  // Replaces useEffect(() => { ... }, [])
  componentDidMount() {
    this.fetchRequests();
  }

  fetchRequests = async () => {
    this.setState({ apiStatus: apiStatusConstants.inProgress });

    try {
      const res = await fetch(`${BASE_URL}/user/requests/received`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch requests");

      const data = await res.json();

      const formattedData = (data.data || []).map((req) => ({
        _id: req._id,
        fromUser: req.fromUserId,
      }));

      this.setState({
        requests: formattedData,
        apiStatus: apiStatusConstants.success,
      });
    } catch (err) {
      console.error("Error fetching requests:", err);
      this.setState({ apiStatus: apiStatusConstants.failure });
    }
  };

  handleRequest = async (requestId, status) => {
    try {
      const res = await fetch(
        `${BASE_URL}/request/review/${status}/${requestId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Failed to update request");

      // Update state by filtering out the handled request
      this.setState((prevState) => ({
        requests: prevState.requests.filter((req) => req._id !== requestId),
      }));
    } catch (err) {
      console.error("Error updating request:", err);
    }
  };

  // 🟢 SUCCESS VIEW
  renderSuccessView = () => {
    const { requests } = this.state;
    const { navigate } = this.props; // Access navigate from props

    if (requests.length === 0) {
      return (
        <EmptyView
          message="No pending requests."
          actionText="Explore Feed"
          onAction={() => navigate("/")}
        />
      );
    }

    return (
      <div className="content-wrapper">
        <div className="header">
          <h1 className="title">Connection Requests</h1>
          <span className="badge">{requests.length}</span>
        </div>

        {requests.map((req) => (
          <RequestCard
            key={req._id}
            request={req}
            onAction={this.handleRequest}
          />
        ))}
      </div>
    );
  };

  // 🎯 MAIN SWITCH
  renderRequests = () => {
    const { apiStatus } = this.state;

    switch (apiStatus) {
      case apiStatusConstants.inProgress:
        return <LoaderView />;

      case apiStatusConstants.failure:
        return (
          <ErrorView
            message="Failed to load requests"
            onRetry={this.fetchRequests}
          />
        );

      case apiStatusConstants.success:
        return this.renderSuccessView();

      default:
        return null;
    }
  };

  render() {
    return (
      <>
        <Header />
        <div className="page-container">{this.renderRequests()}</div>
      </>
    );
  }
}

// HOC Wrapper to allow use of useNavigate in a Class Component
const RequestsWithNavigate = (props) => {
  const navigate = useNavigate();
  return <Requests {...props} navigate={navigate} />;
};

export default RequestsWithNavigate;