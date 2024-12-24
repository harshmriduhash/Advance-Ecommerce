import styled from "styled-components";
import { Container } from "../../styles/styles";
import Breadcrumb from "../../components/common/Breadcrumb";
import { UserContent, UserDashboardWrapper } from "../../styles/user";
import UserMenu from "../../components/user/UserMenu";
import Title from "../../components/common/Title";
import { FormElement, Input } from "../../styles/form";
import { BaseLinkGreen } from "../../styles/button";
import { Link, useNavigate } from "react-router-dom";
import { breakpoints, defaultTheme } from "../../styles/themes/default";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

const AccountScreenWrapper = styled.main`
  .address-list {
    margin-top: 20px;
    grid-template-columns: repeat(2, 1fr);
    gap: 25px;

    @media (max-width: ${breakpoints.lg}) {
      grid-template-columns: repeat(1, 1fr);
    }
  }

  .address-item {
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    padding: 25px;
    row-gap: 8px;
  }

  .address-tags {
    gap: 12px;

    li {
      height: 28px;
      border-radius: 8px;
      padding: 2px 12px;
      background-color: ${defaultTheme.color_whitesmoke};
    }
  }

  .address-btns {
    margin-top: 12px;
    .btn-separator {
      width: 1px;
      border-radius: 50px;
      background: ${defaultTheme.color_platinum};
      margin: 0 10px;
    }
  }
`;

const breadcrumbItems = [
  {
    label: "Home",
    link: "/",
  },
  { label: "Account", link: "/account" },
];

const AccountScreen = () => {
  const [user, setUser] = useState();
  const [add, setAdd] = useState();
  const navigate = useNavigate();
      useEffect(() => {
        const authenticateUser = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                if (!token) {
                    navigate("/sign_in");
                    toast.error("Please Log In first!");
                }
                const response = await axios.get("http://localhost:3000/api/profile", {
                    headers: {
                        Authorization: token
                    }
                });
              console.log(response.data.user);
              setUser(response.data.user);
              setAdd(response.data.user.addressess)
            }
            catch (err) {
                console.log("Error:", err);
            }
        }
        authenticateUser();
      }, []);
      
  return (
    <>
      {user && (
        <AccountScreenWrapper className="page-py-spacing">
          <Container>
            <Breadcrumb items={breadcrumbItems} />
            <UserDashboardWrapper>
              <UserMenu />
              <UserContent>
                <Title titleText={"My Account"} />
                <h4 className="title-sm">Contact Details</h4>
                <form>
                  <div className="form-wrapper">
                    <FormElement className="form-elem">
                      <label
                        htmlFor=""
                        className="form-label font-semibold text-base"
                      >
                        Your Name
                      </label>
                      <div className="form-input-wrapper flex items-center">
                        <Input
                          type="text"
                          className="form-elem-control text-outerspace font-semibold"
                          value={user.email}
                          readOnly
                        />
                        <button type="button" className="form-control-change-btn">
                          Change
                        </button>
                      </div>
                    </FormElement>
                    <FormElement className="form-elem">
                      <label
                        htmlFor=""
                        className="form-label font-semibold text-base"
                      >
                        Email Address
                      </label>
                      <div className="form-input-wrapper flex items-center">
                        <Input
                          type="email"
                          className="form-elem-control text-outerspace font-semibold"
                          value={user.email}
                          readOnly
                        />
                        <button type="button" className="form-control-change-btn">
                          Change
                        </button>
                      </div>
                    </FormElement>
                    <FormElement className="form-elem">
                      <label
                        htmlFor=""
                        className="form-label font-semibold text-base"
                      >
                        Phone Number
                      </label>
                      <div className="form-input-wrapper flex items-center">
                        {user.phone ? (
                          <Input
                            type="text"
                            className="form-elem-control text-outerspace font-semibold"
                            value={user.phone}
                            readOnly
                          />
                        ) : (
                          <Input
                            type="text"
                            className="form-elem-control text-outerspace font-semibold"
                            value="Not present"
                            readOnly
                          />
                        )}
                        <button type="button" className="form-control-change-btn">
                          Change
                        </button>
                      </div>
                    </FormElement>
                  </div>
                </form>
                <div>
                  <h4 className="title-sm">My Contact Addresss</h4>
                  <BaseLinkGreen to="/account/add">Add Address</BaseLinkGreen>
                  <div className="address-list grid">
                    {add.map(item => (
                      <div className="address-item grid">
                      <p className="text-outerspace text-lg font-semibold address-title">
                        {item.firstName}
                      </p>
                      <p className="text-gray text-base font-medium address-description">
                       {item.street}, {item.city}, {item.state}
                      </p>
                      <div className="address-btns flex">
                        <Link
                          to="/"
                          className="text-base text-outerspace font-semibold"
                        >
                          Remove
                        </Link>
                        <div className="btn-separator"></div>
                        <Link
                          to="/"
                          className="text-base text-outerspace font-semibold"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                    ))}
                    <div className="address-item grid">
                      <p className="text-outerspace text-lg font-semibold address-title">
                        {user.firstName}
                      </p>
                      <p className="text-gray text-base font-medium address-description">
                       {user.street}, {user.city}, {user.state}
                      </p>
                      <ul className="address-tags flex flex-wrap">
                        {user.defaultAdd && (
                        <li className="text-gray text-base font-medium inline-flex items-center justify-center">
                          Default billing address
                        </li>
                        )}
                      </ul>
                      <div className="address-btns flex">
                        <Link
                          to="/"
                          className="text-base text-outerspace font-semibold"
                        >
                          Remove
                        </Link>
                        <div className="btn-separator"></div>
                        <Link
                          to="/"
                          className="text-base text-outerspace font-semibold"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </UserContent>
            </UserDashboardWrapper>
          </Container>
        </AccountScreenWrapper>
      )}
    </>
  );
};

export default AccountScreen;
