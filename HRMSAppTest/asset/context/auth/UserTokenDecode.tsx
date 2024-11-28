import { jwtVerify } from "jose";

const token = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6ImVzczEiLCJlbWFpbCI6InN0YW5leS5sb3dAZ21haWwuY29tIiwiaWRlbnRpdHlfaWQiOiI4Iiwicm9sZSI6WyJVU0VSIiwiRW1wbG95ZWUiXSwibWZhX2F1dGhlbnRpY2F0ZWQiOiJUcnVlIiwibmFtZWlkIjoiOCIsImVtcGxveWVlX2lkIjoiMTU3MCIsImVtcGxveWVlX25hbWUiOiJEZW1vIEVtcGxveWVlIDEzOSIsImVtcGxveWVlX251bWJlciI6IjAwMzQiLCJkZXBhcnRtZW50IjoiRVhQRVJUIENTTEwgMSIsImpvYl90aXRsZSI6IkFDQ09VTlQgQVNTSVNUTkFOVCIsImNvbXBhbnlfaWQiOiIxIiwiY29tcGFueV9uYW1lIjoiVFJBSU5JTkcgREVNTyBTRE4gQkhEIiwibmJmIjoxNzMyNzgzMTI0LCJleHAiOjE3MzI3ODM3MjQsImlhdCI6MTczMjc4MzEyNH0.MPRvRMbENHDeQHONRNYpr46T9qMbtnMBX52SMGGRr2QwEmxFhE4U-_zUpLbRnzAmQ6v-F5pJzI2VGnEMkT62jg";

const secret = new TextEncoder().encode("your-256-bit-secret");

const verifyToken = async () => {
  try {
    const { payload } = await jwtVerify(token, secret);
    console.log("Token is valid:", payload);
  } catch (error) {
    console.error("Invalid token:", error);
  }
};

verifyToken();
