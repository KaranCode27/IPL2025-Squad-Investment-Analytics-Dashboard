import os
import pandas as pd
import streamlit as st
import plotly.express as px

# 1. Page Configuration
st.set_page_config(
    page_title="IPL 2025 Squad Investment Dashboard",
    page_icon="🏏",
    layout="wide",
    initial_sidebar_state="expanded"
)

# 2. Custom CSS styling for premium design
st.markdown("""
    <style>
        /* Main background & fonts */
        .main {
            background-color: #0E1118;
            color: #E2E8F0;
            font-family: 'Segoe UI', Roboto, sans-serif;
        }
        /* Sidebar styling */
        section[data-testid="stSidebar"] {
            background-color: #171E2D !important;
            border-right: 1px solid #2B354F;
        }
        /* Custom Cards for KPI metrics */
        .kpi-card {
            background-color: #1A2234;
            border: 1px solid #2A3654;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
            text-align: center;
            transition: transform 0.3s ease;
        }
        .kpi-card:hover {
            transform: translateY(-5px);
            border-color: #00F2FE;
        }
        .kpi-val {
            color: #FFB800;
            font-size: 2.2rem;
            font-weight: 700;
            margin: 5px 0;
            font-family: 'Segoe UI', sans-serif;
        }
        .kpi-label {
            color: #94A3B8;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        /* App Header */
        .app-header {
            background: linear-gradient(135deg, #1A2234 0%, #0F172A 100%);
            border: 1px solid #2A3654;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 25px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            text-align: center;
        }
        .app-title {
            color: #FFFFFF;
            font-size: 2.5rem;
            font-weight: 800;
            margin: 0;
            letter-spacing: 0.5px;
        }
        .app-subtitle {
            color: #FFB800;
            font-size: 1.1rem;
            margin-top: 5px;
            font-weight: 500;
        }
    </style>
""", unsafe_allow_html=True)

# 3. Load Data
@st.cache_data
def load_data():
    # Use workspace paths
    auc_path = "IPL_2025_All_Auction_Data.csv"
    stats_path = "IPL_2025_All_Verified_Stats.csv"
    
    # Read CSVs
    df_auc = pd.read_csv(auc_path)
    df_stats = pd.read_csv(stats_path)
    
    # Merge datasets
    merged = pd.merge(df_auc, df_stats, on="Player", suffixes=("", "_stats"))
    
    # Cast Datatypes
    merged['Final_Player_Price_Cr'] = pd.to_numeric(merged['Final_Player_Price_Cr'], errors='coerce')
    merged['Runs'] = pd.to_numeric(merged['Runs'], errors='coerce').fillna(0).astype(int)
    merged['Wickets'] = pd.to_numeric(merged['Wickets'], errors='coerce').fillna(0).astype(int)
    merged['Matches'] = pd.to_numeric(merged['Matches'], errors='coerce').fillna(0).astype(int)
    merged['StrikeRate'] = pd.to_numeric(merged['StrikeRate'], errors='coerce').fillna(0.0)
    merged['Average'] = pd.to_numeric(merged['Average'], errors='coerce').fillna(0.0)
    merged['Economy'] = pd.to_numeric(merged['Economy'], errors='coerce').fillna(0.0)
    
    # Define calculated column
    merged['Player Tier'] = merged['Final_Player_Price_Cr'].apply(lambda x: 'Marquee (Top 30)' if x >= 11.0 else 'Regular')
    
    return merged

df = load_data()

# 4. App Header
st.markdown("""
    <div class="app-header">
        <h1 class="app-title">🏏 IPL 2025 Squad Investment Dashboard</h1>
        <div class="app-subtitle">Mega Auction & Performance Analytics Platform</div>
    </div>
""", unsafe_allow_html=True)

# 5. Sidebar Navigation & Filters
st.sidebar.markdown("<h2 style='color:#FFB800; font-size:1.4rem; margin-bottom:15px;'>Dashboard Filters</h2>", unsafe_allow_html=True)

# Team Filter
all_teams = sorted(df['Team'].unique())
selected_teams = st.sidebar.multiselect("Select Teams", all_teams, default=all_teams)

# Role Filter
all_roles = sorted(df['Role'].unique())
selected_roles = st.sidebar.multiselect("Select Roles", all_roles, default=all_roles)

# Player Tier Filter
all_tiers = sorted(df['Player Tier'].unique())
selected_tiers = st.sidebar.multiselect("Select Player Tiers", all_tiers, default=all_tiers)

# Filter Dataset
filtered_df = df[
    (df['Team'].isin(selected_teams)) &
    (df['Role'].isin(selected_roles)) &
    (df['Player Tier'].isin(selected_tiers))
]

# Tabs Definition
tab1, tab2, tab3 = st.tabs(["📊 Mega Auction Overview", "🎯 Value & ROI Analysis", "📋 Roster Details"])

# ------------------------------------------------------------------------------
# TAB 1: Mega Auction Overview
# ------------------------------------------------------------------------------
with tab1:
    # KPI metrics row
    kpi_col1, kpi_col2, kpi_col3, kpi_col4 = st.columns(4)
    
    # Calculations
    total_spend = filtered_df['Final_Player_Price_Cr'].sum()
    avg_price = filtered_df['Final_Player_Price_Cr'].mean()
    total_players = len(filtered_df)
    
    if len(filtered_df) > 0:
        most_expensive_idx = filtered_df['Final_Player_Price_Cr'].idxmax()
        most_expensive_player = filtered_df.loc[most_expensive_idx, 'Player']
        most_expensive_val = filtered_df.loc[most_expensive_idx, 'Final_Player_Price_Cr']
    else:
        most_expensive_player = "N/A"
        most_expensive_val = 0.0
        
    with kpi_col1:
        st.markdown(f"""
            <div class="kpi-card">
                <div class="kpi-label">Total Spend</div>
                <div class="kpi-val">₹ {total_spend:,.2f} Cr</div>
            </div>
        """, unsafe_allow_html=True)
        
    with kpi_col2:
        st.markdown(f"""
            <div class="kpi-card">
                <div class="kpi-label">Avg Player Price</div>
                <div class="kpi-val">₹ {avg_price:,.2f} Cr</div>
            </div>
        """, unsafe_allow_html=True)
        
    with kpi_col3:
        st.markdown(f"""
            <div class="kpi-card">
                <div class="kpi-label">Players Count</div>
                <div class="kpi-val">{total_players}</div>
            </div>
        """, unsafe_allow_html=True)
        
    with kpi_col4:
        st.markdown(f"""
            <div class="kpi-card">
                <div class="kpi-label">Most Expensive Buy</div>
                <div class="kpi-val" style="font-size: 1.4rem; padding-top: 10px;">{most_expensive_player} ({most_expensive_val} Cr)</div>
            </div>
        """, unsafe_allow_html=True)
        
    st.markdown("<br>", unsafe_allow_html=True)
    
    # Charts row
    chart_col1, chart_col2 = st.columns(2)
    
    with chart_col1:
        st.markdown("<h3 style='color:#E2E8F0; font-size:1.2rem; margin-bottom:10px;'>Franchise Budget Spending (Cr)</h3>", unsafe_allow_html=True)
        # Aggregate spending by team
        team_spend = filtered_df.groupby('Team')['Final_Player_Price_Cr'].sum().reset_index().sort_values(by='Final_Player_Price_Cr', ascending=False)
        fig_spend = px.bar(
            team_spend,
            x='Team',
            y='Final_Player_Price_Cr',
            color='Final_Player_Price_Cr',
            color_continuous_scale='teal',
            labels={'Final_Player_Price_Cr': 'Spend (Cr)'},
            template='plotly_dark'
        )
        fig_spend.update_layout(
            margin=dict(l=20, r=20, t=10, b=20),
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor='rgba(0,0,0,0)',
            coloraxis_showscale=False
        )
        st.plotly_chart(fig_spend, use_container_width=True)
        
    with chart_col2:
        st.markdown("<h3 style='color:#E2E8F0; font-size:1.2rem; margin-bottom:10px;'>Player Acquisition Type Share</h3>", unsafe_allow_html=True)
        # Count players by acquisition type
        acq_share = filtered_df['Acquisition'].value_counts().reset_index()
        fig_donut = px.pie(
            acq_share,
            names='Acquisition',
            values='count',
            hole=0.45,
            color_discrete_sequence=['#FFB800', '#00F2FE', '#FF5E36'],
            template='plotly_dark'
        )
        fig_donut.update_layout(
            margin=dict(l=20, r=20, t=10, b=20),
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor='rgba(0,0,0,0)'
        )
        st.plotly_chart(fig_donut, use_container_width=True)

# ------------------------------------------------------------------------------
# TAB 2: Value & ROI Analysis
# ------------------------------------------------------------------------------
with tab2:
    st.markdown("<h2 style='color:#FFB800; font-size:1.5rem; margin-bottom:10px;'>Return on Investment (ROI) Scatter Analysis</h2>", unsafe_allow_html=True)
    st.markdown("<p style='color:#94A3B8; font-size:0.95rem; margin-bottom:20px;'>Hover over player bubbles to view custom stats tooltips. Zoom/pan to filter players.</p>", unsafe_allow_html=True)
    
    roi_col1, roi_col2 = st.columns(2)
    
    with roi_col1:
        st.markdown("<h3 style='color:#E2E8F0; font-size:1.2rem;'>Batting ROI: Price vs Runs</h3>", unsafe_allow_html=True)
        fig_bat = px.scatter(
            filtered_df[filtered_df['Runs'] > 0],
            x='Runs',
            y='Final_Player_Price_Cr',
            color='Role',
            size='Runs',
            hover_name='Player',
            hover_data=['Team', 'Matches', 'StrikeRate', 'Average'],
            color_discrete_sequence=px.colors.qualitative.Pastel,
            template='plotly_dark'
        )
        fig_bat.update_layout(
            plot_bgcolor='rgba(26,34,52,0.4)',
            paper_bgcolor='rgba(0,0,0,0)',
            xaxis_title="Runs Scored",
            yaxis_title="Player Cost (Cr)"
        )
        st.plotly_chart(fig_bat, use_container_width=True)
        
    with roi_col2:
        st.markdown("<h3 style='color:#E2E8F0; font-size:1.2rem;'>Bowling ROI: Price vs Wickets</h3>", unsafe_allow_html=True)
        fig_bowl = px.scatter(
            filtered_df[filtered_df['Wickets'] > 0],
            x='Wickets',
            y='Final_Player_Price_Cr',
            color='Role',
            size='Wickets',
            hover_name='Player',
            hover_data=['Team', 'Matches', 'Economy'],
            color_discrete_sequence=px.colors.qualitative.Pastel2,
            template='plotly_dark'
        )
        fig_bowl.update_layout(
            plot_bgcolor='rgba(26,34,52,0.4)',
            paper_bgcolor='rgba(0,0,0,0)',
            xaxis_title="Wickets Taken",
            yaxis_title="Player Cost (Cr)"
        )
        st.plotly_chart(fig_bowl, use_container_width=True)

# ------------------------------------------------------------------------------
# TAB 3: Roster Details
# ------------------------------------------------------------------------------
with tab3:
    st.markdown("<h2 style='color:#FFB800; font-size:1.5rem; margin-bottom:10px;'>Squad Player Grid</h2>", unsafe_allow_html=True)
    
    # Search box
    search_query = st.text_input("🔍 Search Player by Name", "")
    
    display_df = filtered_df.copy()
    if search_query:
        display_df = display_df[display_df['Player'].str.contains(search_query, case=False)]
        
    # Table Formatting
    display_df = display_df[[
        'Player', 'Team', 'Role', 'Final_Player_Price_Cr', 
        'Matches', 'Runs', 'StrikeRate', 'Average', 'Wickets', 'Economy', 'Acquisition', 'Player Tier'
    ]].rename(columns={
        'Final_Player_Price_Cr': 'Price (Cr)',
        'StrikeRate': 'Strike Rate',
        'Player Tier': 'Tier'
    })
    
    # Display Table
    st.dataframe(
        display_df.style.background_gradient(subset=['Price (Cr)'], cmap='YlOrRd')
                        .format({'Price (Cr)': '₹ {:.2f} Cr', 'Strike Rate': '{:.2f}', 'Average': '{:.2f}', 'Economy': '{:.2f}'}),
        use_container_width=True,
        height=500
    )
