import styled from "styled-components";
import { Container } from "../../styles/styles";
import Breadcrumb from "../../components/common/Breadcrumb";
import { UserContent, UserDashboardWrapper } from "../../styles/user";
import UserMenu from "../../components/user/UserMenu";
import Title from "../../components/common/Title";
import { breakpoints, defaultTheme } from "../../styles/themes/default";
import { orderData } from "../../data/data";
import OrderItemList from "../../components/user/OrderItemList";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";

const OrderListScreenWrapper = styled.div`
  .order-tabs-contents {
    margin-top: 40px;
  }
  .order-tabs-head {
    min-width: 170px;
    padding: 12px 0;
    border-bottom: 3px solid ${defaultTheme.color_whitesmoke};

    &.order-tabs-head-active {
      border-bottom-color: ${defaultTheme.color_outerspace};
    }

    @media (max-width: ${breakpoints.lg}) {
      min-width: 120px;
    }

    @media (max-width: ${breakpoints.xs}) {
      min-width: 80px;
    }
  }
`;

const breadcrumbItems = [
  { label: "Home", link: "/" },
  { label: "Order", link: "/order" },
];

const OrderListScreen = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const authenticateUser = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          navigate("/sign_in");
          toast.error("Please Log In first!");
        }
        const response = await axios.get("http://localhost:3000/profile", {
          headers: {
            Authorization: token
          }
        });
        console.log(response.data.user);
        setUser(response.data.user);
      }
      catch (err) {
        console.log("Error:", err);
      }
    }
    authenticateUser();
  }, []);

  return (
    <OrderListScreenWrapper className="page-py-spacing">
      <Container>
        <Breadcrumb items={breadcrumbItems} />
        <UserDashboardWrapper>
          <UserMenu />
          <UserContent>
            <Title titleText={"My Orders"} />
            <div className="order-tabs">
              <div className="order-tabs-heads">
                <button
                  type="button"
                  className="order-tabs-head text-xl italic order-tabs-head-active"
                  data-id="active"
                >
                  Active
                </button>
              </div>

              <div className="order-tabs-contents">
                <div className="order-tabs-content" id="active">
                    <OrderItemList orders = {orderData} />
                </div>
              </div>
            </div>
          </UserContent>
        </UserDashboardWrapper>
      </Container>
    </OrderListScreenWrapper>
  );
};

export default OrderListScreen;
