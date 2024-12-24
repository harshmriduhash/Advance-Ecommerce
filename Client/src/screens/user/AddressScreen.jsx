import styled from "styled-components";
import { Container } from "../../styles/styles";
import Breadcrumb from "../../components/common/Breadcrumb";
import { UserContent, UserDashboardWrapper } from "../../styles/user";
import UserMenu from "../../components/user/UserMenu";
import Title from "../../components/common/Title";
import { FormElement, Input, Textarea } from "../../styles/form";
import { BaseButtonGreen, BaseButtonWhitesmoke } from "../../styles/button";
import { defaultTheme } from "../../styles/themes/default";
import axios from "axios";
import { useEffect, useRef } from "react";

const AddressScreenWrapper = styled.main`
  .form-elem-control {
    padding-left: 16px;
    border: 1px solid ${defaultTheme.color_platinum};

    &:focus {
      border-color: ${defaultTheme.color_silver};
    }
  }
`;

const breadcrumbItems = [
  { label: "Home", link: "/" },
  { label: "Account", link: "/account" },
  { label: "Add Address", link: "/account/add" },
];

const AddressScreen = () => {
  const firstNameRef = useRef();
  const lastNameRef = useRef();
  const countryRef = useRef();
  const companyRef = useRef();
  const streetRef = useRef();
  const cityRef = useRef();
  const stateRef = useRef();
  const phoneRef = useRef();
  const postalRef = useRef();
  const instructionRef = useRef();

  const handleAddress = async () => {
    const firstName = firstNameRef.current.value;
    const lastName = lastNameRef.current.value;
    const country = countryRef.current.value;
    const company = companyRef.current.value;
    const street = streetRef.current.value;
    const city = cityRef.current.value;
    const state = stateRef.current.value;
    const phone = phoneRef.current.value;
    const postal = postalRef.current.value;
    const instruction = instructionRef.current.value;
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.post("http://localhost:3000/api/address", { firstName, lastName, country, company, street, city, state, phone, postal, instruction }, {
        headers: {
          Authorization: token
        }
      });
    }
    catch (err) {
      console.log("Error:", err);
    }
  }

  return (
    <AddressScreenWrapper className="page-py-spacing">
      <Container>
        <Breadcrumb items={breadcrumbItems} />
        <UserDashboardWrapper>
          <UserMenu />
          <UserContent>
            <Title titleText={"My Account"} />
            <h4 className="title-sm">Add Address</h4>
            <form onSubmit={handleAddress}>
              <div className="form-wrapper">
                <FormElement>
                  <label
                    htmlFor=""
                    className="form-label font-semibold text-base"
                  >
                    First Name*
                  </label>
                  <Input
                    ref={firstNameRef}
                    type="text"
                    className="form-elem-control"
                    placeholder="First Name"
                  />
                </FormElement>
                <FormElement>
                  <label
                    htmlFor=""
                    className="form-label font-semibold text-base"
                  >
                    Last Name*
                  </label>
                  <Input
                    ref={lastNameRef}
                    type="text"
                    className="form-elem-control"
                    placeholder="Last Name"
                  />
                </FormElement>
                <FormElement>
                  <label
                    htmlFor=""
                    className="form-label font-semibold text-base"
                  >
                    Contry / Region
                  </label>
                  <Input
                    ref={countryRef}
                    type="text"
                    className="form-elem-control"
                    placeholder="Country/Region"
                  />
                </FormElement>
                <FormElement>
                  <label
                    htmlFor=""
                    className="form-label font-semibold text-base"
                  >
                    Company Name*
                  </label>
                  <Input
                    ref={companyRef}
                    type="text"
                    className="form-elem-control"
                    placeholder="Company (optional)"
                  />
                </FormElement>
                <FormElement>
                  <label
                    htmlFor=""
                    className="form-label font-semibold text-base"
                  >
                    Street Address*
                  </label>
                  <Input
                    ref={streetRef}
                    type="text"
                    className="form-elem-control"
                    placeholder="House number and street name"
                  />
                </FormElement>
                <FormElement>
                  <label
                    htmlFor=""
                    className="form-label font-semibold text-base"
                  >
                    City*
                  </label>
                  <Input
                    ref={cityRef}
                    type="text"
                    className="form-elem-control"
                    placeholder="Town / City"
                  />
                </FormElement>
                <FormElement>
                  <label
                    htmlFor=""
                    className="form-label font-semibold text-base"
                  >
                    State*
                  </label>
                  <Input
                    ref={stateRef}
                    type="text"
                    className="form-elem-control"
                    placeholder="Town / City"
                  />
                </FormElement>
                <FormElement>
                  <label
                    htmlFor=""
                    className="form-label font-semibold text-base"
                  >
                    Phone*
                  </label>
                  <Input
                    ref={phoneRef}
                    type="tel"
                    className="form-elem-control"
                    placeholder="Phone"
                  />
                </FormElement>
                <FormElement>
                  <label
                    htmlFor=""
                    className="form-label font-semibold text-base"
                  >
                    Postal Code*
                  </label>
                  <Input
                    ref={postalRef}
                    type="number"
                    className="form-elem-control"
                    placeholder="Postal Code"
                  />
                </FormElement>
                <FormElement>
                  <label
                    htmlFor=""
                    className="form-label font-semibold text-base"
                  >
                    Delivery Instruction
                  </label>
                  <Input
                    ref={instructionRef}
                    className="form-elem-control"
                    placeholder="Delivery Instruction"
                    name=""
                    id=""
                  ></Input>
                </FormElement>
              </div>
              <div className="form-btns flex">
                <BaseButtonGreen type="submit">Save</BaseButtonGreen>
                <BaseButtonWhitesmoke type="button">
                  Cancel
                </BaseButtonWhitesmoke>
              </div>
            </form>
          </UserContent>
        </UserDashboardWrapper>
      </Container>
    </AddressScreenWrapper>
  );
};

export default AddressScreen;
