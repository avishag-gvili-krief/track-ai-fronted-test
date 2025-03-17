import axiosInstance from "./axiosInstance";

interface SmsDto {
  id?: string;
  container: string;
  mobileList: string;
  shipmentId?: string;
}

export const fetchPhoneNumbers = async (containerIds: string[]) => {
  if (containerIds.length === 0) return {};

  try {
    const response = await axiosInstance.post("/Sms/by-containers", containerIds);
    const phoneData = response.data; 
    
    return phoneData.reduce((acc: { [key: string]: { phone: string, shipmentId: string } }, sms: SmsDto) => {
      acc[sms.container] = { phone: sms.mobileList, shipmentId: sms.shipmentId || "" };
      return acc;
    }, {});
  } catch (error) {
    console.error("Error fetching phone numbers:", error);
    return {};
  }
};

export const createPhoneNumber = async (container: string, phoneNumber: string, shipmentId: string) => {
  try {
    await axiosInstance.post("/Sms", {
      container,
      mobileList: phoneNumber,
      shipmentId,
    });
  } catch (error) {
    console.error("Error creating phone number:", error);
  }
};

export const updatePhoneNumber = async (id: string, container: string, phoneNumber: string, shipmentId: string) => {
  try {
    await axiosInstance.put(`/Sms/${id}`, {
      id,
      container,
      mobileList: phoneNumber,
      shipmentId,
    });
  } catch (error) {
    console.error("Error updating phone number:", error);
  }
};
