"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import UserProfileComponent from "./UserComponent";

const UserProfilePage = () => {
  return <UserProfileComponent user={useAuth().user!} />;
};

export default UserProfilePage;
