// src/backendConnections/apiServices.ts
import { Alert } from 'react-native';
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://your-backend-api-url.com/api';

// DB QUERRY CALLS ARE NOT TO BE MADE HERE---- THIS IS A FRONTEND HELPER FILE ONLY
//------- DATA FETCHING ROUTE IMPORTS from backend server/src/routes/dataFetchingRoutes
import setupBrandsAndMappingRoutes from '../../server/src/routes/dataFetchingRoutes/brandMappingFetch';
import setupClientReportsRoutes from '../../server/src/routes/dataFetchingRoutes/clientReports';
import setupCollectionReportsRoutes from '../../server/src/routes/dataFetchingRoutes/collectionReports';
import setupCompetitionReportsRoutes from '../../server/src/routes/dataFetchingRoutes/competetionReports';
import setupDailyTasksRoutes from '../../server/src/routes/dataFetchingRoutes/dailyTasks';
import setupDdpRoutes from '../../server/src/routes/dataFetchingRoutes/ddp';
import setupDealerReportsRoutes from '../../server/src/routes/dataFetchingRoutes/dealerReportandScores';
import setupDealersRoutes from '../../server/src/routes/dataFetchingRoutes/dealers';
import setupDailyVisitReportsRoutes from '../../server/src/routes/dataFetchingRoutes/dvr';
import setupTechnicalVisitReportsRoutes from '../../server/src/routes/dataFetchingRoutes/tvr';
import setupPJPRoutes from '../../server/src/routes/dataFetchingRoutes/pjp';
import setupRatingsRoutes from '../../server/src/routes/dataFetchingRoutes/ratings';
import setupSalesOrdersRoutes from '../../server/src/routes/dataFetchingRoutes/salesOrder';
import setupSalesReportRoutes from '../../server/src/routes/dataFetchingRoutes/salesReports';
import setupSalesmanAttendanceRoutes from '../../server/src/routes/dataFetchingRoutes/salesmanAttendance';
import setupSalesmanLeaveApplicationsRoutes from '../../server/src/routes/dataFetchingRoutes/salesmanLeaveApplications';

//------- DATA/FORM SUBMISSION ROUTE IMPORTS from backend server/src/routes/formSubmissionRoutes
import AddDealerForm from '../../server/src/routes/formSubmissionRoutes/addDealer';
import AttendanceInForm from '../../server/src/routes/formSubmissionRoutes/attendanceIn';
import AttendanceOutForm from '../../server/src/routes/formSubmissionRoutes/attendanceOut';
import BrandMappingForm from '../../server/src/routes/formSubmissionRoutes/brandMapping';
import ClientReportsForm from '../../server/src/routes/formSubmissionRoutes/clientRepots';
import CompetitionReportsForm from '../../server/src/routes/formSubmissionRoutes/competitionReport';
import SalesOrderForm from '../../server/src/routes/formSubmissionRoutes/salesOrder';
import DVRForm from '../../server/src/routes/formSubmissionRoutes/dvr';
import TVRForm from '../../server/src/routes/formSubmissionRoutes/tvr';

//------- IMAGE SUBMISSION/STORAGE + URI FETCHING ROUTE IMPORTS from backend server/src/routes/cloudfareRoutes
import CloudfareRoute from '../../server/src/routes/cloudfareRoutes/cloudfare';

//------- GEOTRACKING FETCHING/SUBMISSION ROUTE IMPORTS from backend server/src/routes/geoTrackingRoutes
import GeoTrackingRoute from '../../server/src/routes/geoTrackingRoutes/route';

// --- DATA TYPES (These define the "shape" of the data your API will return) ---
export type User = { id: number; firstName: string; lastName: string; companyId: number; role: string; };
export type Company = { id: number; companyName: string; };
export type Dealer = { id: string; name: string; address?: string };

// --- PAYLOAD TYPES (These define the data sent TO your API) ---
export type DvrPayload = { [key: string]: any };
export type TvrPayload = { [key: string]: any };
export type SalesOrderPayload = { [key: string]: any };
export type LeaveApplicationPayload = { [key: string]: any };
export type DealerPayload = { [key: string]: any };
export type PjpPayload = { [key: string]: any };
export type AttendancePayload = { [key:string]: any };
export type CompetitionReportPayload = { [key: string]: any };


// --- HELPER FUNCTION FOR MAKING API REQUESTS ---
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<{ success: boolean, data: T | null, error?: string }> {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${your_auth_token}` // Add auth headers if needed
            },
            ...options,
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || `Request failed with status ${response.status}`);
        }

        return { success: true, data: result.data };

    } catch (error: any) {
        console.error(`API Error on ${endpoint}:`, error);
        Alert.alert("API Error", error.message || "An unexpected error occurred.");
        return { success: false, data: null, error: error.message };
    }
}

// --- FETCH (GET) FUNCTIONS ---
// These functions call the API endpoints that are set up by your imported route files.

// Corresponds to the route that fetches a user by their ID
export const getUser = (userId: number) => apiRequest<User>(`/users/${userId}`);

// Corresponds to the route that fetches a company by its ID
export const getCompany = (companyId: number) => apiRequest<Company>(`/companies/${companyId}`);

// Corresponds to the route set up by `setupDealersRoutes`
export const getDealersForUser = (userId: number) => apiRequest<Dealer[]>(`/users/${userId}/dealers`);

// Corresponds to the route set up by `setupBrandsAndMappingRoutes`
export const getBrands = () => apiRequest<string[]>('/brands');

// --- SUBMIT (POST) FUNCTIONS ---
// These functions call the endpoints set up by your form submission route files.

// Corresponds to the endpoint from `DVRForm` import
export const createDvr = (payload: DvrPayload) => apiRequest('/dvr', { method: 'POST', body: JSON.stringify(payload) });

// Corresponds to the endpoint from `TVRForm` import
export const createTvr = (payload: TvrPayload) => apiRequest('/tvr', { method: 'POST', body: JSON.stringify(payload) });

// Corresponds to the endpoint from `SalesOrderForm` import
export const createSalesOrder = (payload: SalesOrderPayload) => apiRequest('/sales-orders', { method: 'POST', body: JSON.stringify(payload) });

export const createLeaveApplication = (payload: LeaveApplicationPayload) => apiRequest('/leave-applications', { method: 'POST', body: JSON.stringify(payload) });

// Corresponds to the endpoint from `AddDealerForm` import
export const createDealer = (payload: DealerPayload) => apiRequest('/dealers', { method: 'POST', body: JSON.stringify(payload) });

export const createPjp = (payload: PjpPayload) => apiRequest('/pjp', { method: 'POST', body: JSON.stringify(payload) });

// Corresponds to the endpoint from `AttendanceInForm` import
export const createAttendanceIn = (payload: AttendancePayload) => apiRequest('/attendance/in', { method: 'POST', body: JSON.stringify(payload) });

// Corresponds to the endpoint from `CompetitionReportsForm` import
export const createCompetitionReport = (payload: CompetitionReportPayload) => apiRequest('/competition-reports', { method: 'POST', body: JSON.stringify(payload) });

// --- UPDATE (PATCH/PUT) FUNCTIONS ---
// Corresponds to the endpoint from `AttendanceOutForm` import
export const createAttendanceOut = (payload: AttendancePayload) => apiRequest(`/attendance/out`, { method: 'PATCH', body: JSON.stringify(payload) });


// --- IMAGE UPLOAD FUNCTION ---
// This function calls the endpoint defined in your `CloudfareRoute` import
export const uploadImage = async (imageUri: string) => {
    const formData = new FormData();
    // @ts-ignore
    formData.append('file', {
        uri: imageUri,
        name: `photo_${Date.now()}.jpg`,
        type: 'image/jpeg',
    });

    try {
        const response = await fetch(`${BASE_URL}/upload-image`, {
            method: 'POST',
            headers: { 'Content-Type': 'multipart/form-data' },
            body: formData,
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        return { success: true, data: result.data as { url: string } };
    } catch (error: any) {
        console.error(`Image upload failed:`, error);
        Alert.alert("Upload Error", "Could not upload the image.");
        return { success: false, data: null };
    }
};