import { useEffect, useState } from "react";
import { 
    Box, 
    Card, 
    CardContent, 
    Typography, 
    Button,
    useTheme
} from "@mui/material";

import PaidIcon from "@mui/icons-material/Paid";
import MessageIcon from "@mui/icons-material/Message";
import FolderSharedIcon from "@mui/icons-material/FolderShared"; 
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

import {
    countCollection,
    countDocumentsByType
} from "../services/solde";

import {
    Chart as ChartJS,
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
} from "chart.js";

import { Pie, Bar } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";

ChartJS.register(
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
);


// ------------------------------------------------------------
// CARD
// ------------------------------------------------------------
const SummaryCard = ({ label, value, icon: Icon, iconColor, linkPath, navigate }) => (
    <Card 
        sx={{ 
            height: 160,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            borderRadius: 3,
            transition: ".3s",
            '&:hover': { boxShadow: 8 }
        }}
    >
        <CardContent sx={{ display: "flex", alignItems: "center" }}>
            <Icon 
                sx={{ 
                    fontSize: 48,
                    color: iconColor,
                    mr: 2,
                    p: 1,
                    borderRadius: "14px",
                    backgroundColor: iconColor + "22"
                }} 
            />
            <Box>
                <Typography variant="body2" color="text.secondary">
                    {label}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: "bold", mt: .5 }}>
                    {value}
                </Typography>
            </Box>
        </CardContent>

        <Box sx={{ px: 2, pb: 1, display: "flex", justifyContent: "flex-end" }}>
            <Button  onClick={() => {
                navigate(linkPath)
            }} size="small" color="primary">
                Voir détails
            </Button>
        </Box>
    </Card>
);


// ------------------------------------------------------------
// PAGE
// ------------------------------------------------------------
export default function DashboardHome() {
    const navigate = useNavigate();

    const theme = useTheme();

    const [counts, setCounts] = useState({
        solde: 0,
        pension: 0,
        services: 0,
        messages: 0
    });

    const colors = {
        solde: theme.palette.info.main,
        pension: theme.palette.secondary.main,
        services: theme.palette.success.main,
        messages: theme.palette.warning.main
    };

    useEffect(() => {
        const load = async () => {
            const [
                soldeCount,
                pensionCount,
                servicesCount,
                messagesCount
            ] = await Promise.all([
                countDocumentsByType("solde"),
                countDocumentsByType("pension"),
                countCollection("services"),
                countCollection("messages")
            ]);

            setCounts({
                solde: soldeCount,
                pension: pensionCount,
                services: servicesCount,
                messages: messagesCount
            });
        };

        load();
    }, []);


    // --------------------------------------------------------
    // CHARTS
    // --------------------------------------------------------
    const pieData = {
        labels: ["Soldes", "Pensions", "Services", "Messages"],
        datasets: [
            {
                data: [
                    counts.solde,
                    counts.pension,
                    counts.services,
                    counts.messages
                ],
                backgroundColor: [
                    colors.solde,
                    colors.pension,
                    colors.services,
                    colors.messages
                ],
                borderColor: theme.palette.background.paper,
                borderWidth: 2
            }
        ]
    };

    const barData = {
        labels: ["Soldes", "Pensions", "Services", "Messages"],
        datasets: [
            {
                label: "Totaux",
                data: [
                    counts.solde,
                    counts.pension,
                    counts.services,
                    counts.messages
                ],
                backgroundColor: [
                    colors.solde,
                    colors.pension,
                    colors.services,
                    colors.messages
                ],
                borderRadius: 6
            }
        ]
    };


    return (
        <Box px={2} py={5} sx={{ minHeight: '100vh' }}>

            {/* --------------------------------------------- */}
            {/* SUMMARY CARDS — fullwidth responsive fluid */}
            {/* --------------------------------------------- */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: 2,
                    mb: 4
                }}
            >
                <SummaryCard 
                    label="Soldes"
                    value={counts.solde}
                    icon={AccountBalanceWalletIcon}
                    iconColor={colors.solde}
                    linkPath="/pjsp/soldes"
                    navigate={navigate}
                />

                <SummaryCard 
                    navigate={navigate}
                    label="Pensions"
                    value={counts.pension}
                    icon={PaidIcon}
                    iconColor={colors.pension}
                    linkPath="/pjsp/pensions"
                />

                <SummaryCard 
                    navigate={navigate}
                    label="Messages"
                    value={counts.messages}
                    icon={MessageIcon}
                    iconColor={colors.messages}
                    linkPath="/pjsp/messages"
                />
            </Box>


            {/* --------------------------------------------- */}
            {/* GRAPHS */}
            {/* --------------------------------------------- */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: 2
                }}
            >
                <Card sx={{ height: 380, borderRadius: 3 }}>
                    <CardContent>
                        <Box sx={{ height: 320 }}>
                            <Pie data={pieData} />
                        </Box>
                    </CardContent>
                </Card>

                <Card sx={{ height: 380, borderRadius: 3 }}>
                    <CardContent>
                        <Box sx={{ height: 320 }}>
                            <Bar data={barData} />
                        </Box>
                    </CardContent>
                </Card>
            </Box>

        </Box>
    );
}