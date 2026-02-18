import React, {useState} from "react";
import {AuthLayout} from "../components/Auth/AuthLayout";
import {AuthCard} from "../components/Auth/AuthCard";
import {AuthHeader} from "../components/Auth/AuthHeader";
import {FormInput} from "../components/Auth/FormInput";
import {PrimaryButton} from "../components/Auth/PrimaryButton";
import {AuthFooter} from "../components/Auth/AuthFooter";

export function LoginPage(){
    const [userEmailAddress, setUserEmailAddress] = useState("");
    const [userPassword, setUserPassword] = useState("");

    const handleLogin = async(e)=>{
        e.preventDefault();

        const response = await fetch("http://localhost:8000/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            credentials: "include",
            body: JSON.stringify({
                email_address: userEmailAddress,
                raw_password: userPassword
            }),
        });

        const result = await response.json();
        alert(result.message);
    }

    return(
        <AuthLayout>
            <AuthCard>
                <form 
                className="flex flex-col h-full p-4 space-y-4 md:p-6 lg:p-8"
                onSubmit={handleLogin}>

                    <AuthHeader title="Login"/>

                    <FormInput 
                    label="Email Address:" 
                    id="emailAddress" 
                    type="email" 
                    placeholder="youremail@domain.com"
                    value={userEmailAddress} 
                    onChangeValue={setUserEmailAddress}/>

                    <FormInput 
                    label="Password:" 
                    id="password" 
                    type="password" 
                    placeholder="Enter your password"
                    value={userPassword} 
                    onChangeValue={setUserPassword}/>

                    <div className="flex pt-4 justify-center">
                        <PrimaryButton text="Login"/>
                    </div>

                    <AuthFooter text="Don't have an account?" linkText="Sign Up" linkTo="/signup"/>
                </form>
            </AuthCard>
        </AuthLayout>
    );
}