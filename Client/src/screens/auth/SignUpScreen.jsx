import styled from "styled-components";
import {
  CheckboxGroup,
  FormGridWrapper,
  FormTitle,
} from "../../styles/form_grid";
import { Container } from "../../styles/styles";
import { staticImages } from "../../utils/images";
import AuthOptions from "../../components/auth/AuthOptions";
import { FormElement, Input } from "../../styles/form";
import PasswordInput from "../../components/auth/PasswordInput";
import { Link } from "react-router-dom";
import { BaseButtonBlack } from "../../styles/button";
import { useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const SignUpScreenWrapper = styled.section`
  form {
    margin-top: 40px;
    .form-elem-text {
      margin-top: -16px;
      display: block;
    }
  }

  .text-space {
    margin: 0 4px;
  }
`;

const SignUpScreen = () => {
    const emailRef = useRef();
    const passwordRef = useRef();

    const handleSignup = async (e) => {
        const email = emailRef.current.value;
        const password = passwordRef.current.value;
        e.preventDefault();        
        try {
            const response = await axios.post("http://localhost:3000/api/register", { email, password });
            console.log(response);
            if (response.status === 200) {
            toast.success("Account created successfully! You can now login");
            }
            emailRef.current.value = "";
            passwordRef.current.value = "";
        }
        catch (err) {
            console.log("Error:", err);
            if (err.response && err.response.status === 409) {
                toast.error("User already exists!");
            }
            else {
                toast.error("An unexpected error occurred.");
            }
        }
    }

  return (
    <SignUpScreenWrapper>
      <FormGridWrapper>
        <Container>
          <div className="form-grid-content">
            <div className="form-grid-left">
              <img
                src={staticImages.form_img2}
                className="object-fit-cover"
                alt=""
              />
            </div>
            <div className="form-grid-right">
              <FormTitle>
                <h3>Sign Up</h3>
                <p className="text-base">
                  Sign up for free to access to in any of our products
                </p>
              </FormTitle>
              <form onSubmit={handleSignup}>
                <FormElement>
                  <label htmlFor="" className="forme-elem-label">
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
                  <span className="form-elem-error">
                    *Please enter valid email address.
                  </span>
                </FormElement>
                <FormElement>
                  <label htmlFor="" className="forme-elem-label">
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
                  <span className="form-elem-error">
                    *Please enter valid password.
                  </span>
                </FormElement>
                {/* <PasswordInput fieldName="Password" name="password" passwordRef={passwordRef} /> */}
                <span className="form-elem-text font-medium">
                  Use 8 or more characters with a mix of letters, numbers &
                  symbols
                </span>
                <BaseButtonBlack type="submit" className="form-submit-btn">
                  Sign Up
                </BaseButtonBlack>
              </form>
              <p className="flex flex-wrap account-rel-text">
                Already have an account?
                <Link to="/sign_in" className="font-medium">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </Container>
      </FormGridWrapper>
    </SignUpScreenWrapper>
  );
};

export default SignUpScreen;
