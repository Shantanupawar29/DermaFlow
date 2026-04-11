import React, { useState } from 'react';
import { MapPin, Navigation, Loader } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function LocationDetector({ onAddressFetched, buttonText = "Use My Location", className = "" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getLocationAndAddress = () => {
    setLoading(true);
    setError(null);
    
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await fetchAddressFromCoords(latitude, longitude);
      },
      (error) => {
        console.error("Geolocation error:", error);
        if (error.code === 1) {
          setError("Please allow location access to use this feature");
        } else if (error.code === 2) {
          setError("Location unavailable. Please enter manually");
        } else {
          setError("Failed to get location. Please enter address manually");
        }
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const fetchAddressFromCoords = async (lat, lng) => {
    try {
      // Using OpenStreetMap Nominatim API (free, no API key required)
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      
      const data = response.data;
      const address = data.address;
      
      const formattedAddress = {
        street: address.road || address.suburb || address.neighbourhood || '',
        city: address.city || address.town || address.village || '',
        state: address.state || '',
        zipCode: address.postcode || '',
        country: address.country || 'India',
        fullAddress: data.display_name
      };
      
      // Try to get pincode details from India Post API if pincode is available
      if (formattedAddress.zipCode && formattedAddress.zipCode.length === 6) {
        try {
          const pincodeRes = await axios.get(`${API_URL}/pincode/${formattedAddress.zipCode}`);
          if (pincodeRes.data[0]?.Status === 'Success' && pincodeRes.data[0]?.PostOffice?.length > 0) {
            const postOffice = pincodeRes.data[0].PostOffice[0];
            formattedAddress.city = postOffice.District || formattedAddress.city;
            formattedAddress.state = postOffice.State || formattedAddress.state;
          }
        } catch (e) {
          console.log("Pincode API error:", e);
        }
      }
      
      if (onAddressFetched) {
        onAddressFetched(formattedAddress);
      }
      
      alert("Location detected! Address filled automatically.");
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      setError("Could not fetch address from coordinates");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={getLocationAndAddress}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader size={18} className="animate-spin" />
            Detecting location...
          </>
        ) : (
          <>
            <Navigation size={18} />
            {buttonText}
          </>
        )}
      </button>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}