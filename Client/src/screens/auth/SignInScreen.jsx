import styled from "styled-components";
import { FormGridWrapper, FormTitle } from "../../styles/form_grid";
import { Container } from "../../styles/styles";
import { staticImages } from "../../utils/images";
import AuthOptions from "../../components/auth/AuthOptions";
import { FormElement, Input } from "../../styles/form";
import PasswordInput from "../../components/auth/PasswordInput";
import { Link, useNavigate } from "react-router-dom";
import { BaseButtonBlack } from "../../styles/button";
import { breakpoints, defaultTheme } from "../../styles/themes/default";
import { useRef } from "react";
import toast from "react-hot-toast";
import axios from "axios";

const SignInScreenWrapper = styled.section`
  .form-separator {
    margin: 32px 0;
    column-gap: 18px;

    @media (max-width: ${breakpoints.lg}) {
      margin: 24px 0;
    }

    .separator-text {
      border-radius: 50%;
      min-width: 36px;
      height: 36px;
      background-color: ${defaultTheme.color_purple};
      position: relative;
    }

    .separator-line {
      width: 100%;
      height: 1px;
      background-color: ${defaultTheme.color_platinum};
    }
  }

  .form-elem-text {
    margin-top: -16px;
    display: block;
  }
`;

const SignInScreen = () => {
    const navigate = useNavigate();
    const emailRef = useRef();
    const passwordRef = useRef();

    const handleLogin = async (e) => {
        e.preventDefault();
        const email = emailRef.current.value;
        const password = passwordRef.current.value;
        try {
            const response = await axios.post("http://localhost:3000/api/login", { email, password });
            const accessToken = response.data.token;
            localStorage.setItem("accessToken", accessToken);
            toast.success("Successfully Logged In!");
            navigate("/account");
        }
        catch (err) {
            console.log("Error:", err);
            if (err.response && err.response.status === 409) {
                toast.error("User is not Registered!");
            }
            else if (err.response && err.response.status === 403) {
                toast.error("Invalid Password!");
            }
            else {
                toast.error("An unexpected error occurred.");
            }
        }
    }

  return (
    <SignInScreenWrapper>
      <FormGridWrapper>
        <Container>
          <div className="form-grid-content">
            <div className="form-grid-left">
              <img src={staticImages.form_img1} className="object-fit-cover" />
            </div>
            <div className="form-grid-right">
              <FormTitle>
                <h3>Sign In</h3>
              </FormTitle>
              <form onSubmit={handleLogin}>
                <FormElement>
                  <label htmlFor="" className="form-elem-label">
                    User name or email address
                  </label>
                  <Input
                    type="text"
                    placeholder=""
                    name=""
                    className="form-elem-control"
                    ref={emailRef}
                    required
                  />
                </FormElement>
                <FormElement>
                  <label htmlFor="" className="form-elem-label">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder=""
                    name=""
                    className="form-elem-control"
                    ref={passwordRef}
                    required
                  />
                </FormElement>
                <Link
                  to="/reset"
                  className="form-elem-text text-end font-medium"
                >
                  Forgot your password?
                </Link>
                <BaseButtonBlack type="submit" className="form-submit-btn">
                  Sign In
                </BaseButtonBlack>
              </form>
              <p className="flex flex-wrap account-rel-text">
                Don&apos;t have a account?
                <Link to="/sign_up" className="font-medium">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </Container>
      </FormGridWrapper>
    </SignInScreenWrapper>
  );
};

export default SignInScreen;
