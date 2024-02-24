export interface LocationData {
  ip: string;
  location: {
    latitude: number;
    longitude: number;
    city: string;
    reserved: boolean;
    region: {
      name: string;
      code: string;
    };
    country: {
      name: string;
      code: string;
      iso3: string;
      capital: string;
      tld: string;
      population: number;
      area: number;
      callingCode: string;
      postalCode: string;
      timezone: {
        code: string;
        offset: string;
      };
      currency: {
        name: string;
        code: string;
      };
      languages: string[];
    };
    continent: {
      code: string;
      inEu: boolean;
    };
  };
}
