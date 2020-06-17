export default interface UserData {
    userId:       number;
    firstName:    string;
    lastName:     string;
    email:        string;
    userName:     string;
    regionPrefix: string;
    jobFilter:    string;
    accessToken:  string;
    accountName:  null;
    accountType:  number;
    street:       string;
    houseNumber:  string;
    zipCode:      string;
    city:         string;
    phoneNumber:  string;
    isWorking:    boolean;
    paused:       boolean;
    countryCode:  string;
    contractType: number;
    vip:          boolean;
}
