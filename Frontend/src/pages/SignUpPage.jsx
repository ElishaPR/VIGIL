import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {AuthLayout} from "../components/Auth/AuthLayout";
import {AuthCard} from "../components/Auth/AuthCard";
import {AuthHeader} from "../components/Auth/AuthHeader";
import {FormInput} from "../components/Auth/FormInput";
import {PrimaryButton} from "../components/Auth/PrimaryButton";
import {AuthFooter} from "../components/Auth/AuthFooter";


export function SignUpPage(){
    const navigate = useNavigate();
    const [userEmailAddress, setUserEmailAddress] = useState("");
    const [userDisplayName, setUserDisplayName] = useState("");
    const [userPassword, setUserPassword] = useState("");
    const [isIndiaResident, setIsIndiaResident] = useState(false);

    const handleSignUp = async(e)=>{
        e.preventDefault();

        const response = await fetch("http://localhost:8000/users/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({
                email_address: userEmailAddress,
                display_name: userDisplayName,
                raw_password: userPassword,
                is_india_resident: isIndiaResident
            }),
        });

        const result = await response.json();
        alert(result.message);
        if (response.ok){
            setTimeout(() => {
                navigate("/login");
            }, 1500);
        }
    };
    
    return(
        <AuthLayout>
            <AuthCard>
                <form 
                className="flex flex-col h-full p-4 space-y-4 md:p-6 lg:p-8"
                onSubmit={handleSignUp}>

                    <AuthHeader title="Sign Up"/>

                    <FormInput 
                    label="Email Address:" 
                    id="emailAddress" 
                    type="email" 
                    placeholder="youremail@domain.com" 
                    helperText="Email notifications will be sent to this email address." 
                    value={userEmailAddress} 
                    onChangeValue={setUserEmailAddress}/>

                    <FormInput 
                    label="Full Name:" 
                    id="displayName" 
                    type="text" 
                    placeholder="Enter your Full Name" 
                    helperText="This name will be shown on your dashboard." 
                    value={userDisplayName} 
                    onChangeValue={setUserDisplayName}/>

                    <FormInput 
                    label="Password:" 
                    id="password" 
                    type="password" 
                    placeholder="Enter your password" 
                    helperText="Password must be atleast 8 characters long."
                    value={userPassword} 
                    onChangeValue={setUserPassword}/>

                    <div className="flex flex-col space-y-2 md:flex md:flex-row md:items-center md:gap-4">
                        <label htmlFor="isIndiaResident" className="text-black text-sm font-medium flex items-center space-x-2 md:text-base md:flex-shrink-0">
                            <input type="checkbox" id="isIndiaResident" name="isIndiaResident" checked={isIndiaResident} onChange={(e) => setIsIndiaResident(e.target.checked)}/>
                            <span>I agree that I am currently residing in India.</span>
                        </label>
                    </div>

                    <div className="flex justify-center space-x-2 mt-auto py-4 md:flex md:flex-row md:items-center md:gap-28 md:justify-center">
                        <PrimaryButton text="Sign Up" />
                    </div>

                    <AuthFooter text="Already have an account?" linkText="Log in" linkTo="/login"/>
                </form>
            </AuthCard>
        </AuthLayout>
    );
}