/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";

import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import App from "./app/App";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualEventService = powerbi.extensibility.IVisualEventService;

import { VisualFormattingSettingsModel } from "./settings";

type AcqType = "Retained" | "Auction" | "RTM";
type Role    = "Batter" | "Bowler" | "All-rounder" | "WK-Batter";
type Tier    = "Elite" | "Premium" | "Value" | "Budget";

interface Player {
  name: string; team: string; role: Role; price: number;
  matches: number; runs: number; wickets: number; avg: number;
  economy: number; strikeRate: number; acqType: AcqType;
  tier: Tier; valuationScore: number; roiScore: number;
}

export class Visual implements IVisual {
    private events: IVisualEventService;
    private target: HTMLElement;
    private root: Root;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;

    constructor(options: VisualConstructorOptions) {
        console.log('Visual constructor', options);
        this.events = options.host.eventService;
        this.formattingSettingsService = new FormattingSettingsService();
        this.target = options.element;
        
        // Clean target container and create React root
        while (this.target.firstChild) {
            this.target.removeChild(this.target.firstChild);
        }
        this.root = createRoot(this.target);
        
        // Render the React Dashboard application initially with empty array (defaults to mock)
        this.root.render(React.createElement(App, { players: [] }));
    }

    public update(options: VisualUpdateOptions) {
        this.events.renderingStarted(options);

        try {
            this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(VisualFormattingSettingsModel, options.dataViews[0]);
            console.log('Visual update', options);

            const dataViews = options.dataViews;
            if (!dataViews || !dataViews[0] || !dataViews[0].categorical) {
                this.root.render(React.createElement(App, { players: [] }));
                this.events.renderingFinished(options);
                return;
            }

            const categorical = dataViews[0].categorical;
            const categories = categorical.categories;
            const values = categorical.values;

            // If we don't have categories (e.g. Player names), render fallback PLAYERS
            if (!categories || categories.length === 0 || !categories[0].values) {
                this.root.render(React.createElement(App, { players: [] }));
                this.events.renderingFinished(options);
                return;
            }

            const playerNames = categories[0].values;
            const rowCount = playerNames.length;

            const players: Player[] = [];
            for (let i = 0; i < rowCount; i++) {
                const name = String(playerNames[i]);
                
                let team = "Other";
                let role: Role = "Batter";
                let price = 0;
                let matches = 0;
                let runs = 0;
                let wickets = 0;
                let avg = 0;
                let economy = 0;
                let strikeRate = 0;
                let acqType: AcqType = "Auction";
                let tier: Tier = "Regular" as any;
                let valuationScore = 50;
                let roiScore = 0;

                if (values) {
                    for (let j = 0; j < values.length; j++) {
                        const col = values[j];
                        const val = col.values[i];
                        const displayName = col.source.displayName.toLowerCase();

                        if (displayName.includes("team")) {
                            team = String(val);
                        } else if (displayName.includes("role")) {
                            const rStr = String(val).toLowerCase();
                            if (rStr.includes("all")) role = "All-rounder";
                            else if (rStr.includes("bowl")) role = "Bowler";
                            else if (rStr.includes("wk") || rStr.includes("wicket")) role = "WK-Batter";
                            else role = "Batter";
                        } else if (displayName.includes("price") || displayName.includes("cost") || displayName.includes("spend") || displayName.includes("final")) {
                            price = Number(val) || 0;
                        } else if (displayName.includes("match")) {
                            matches = Number(val) || 0;
                        } else if (displayName.includes("runs")) {
                            runs = Number(val) || 0;
                        } else if (displayName.includes("wicket")) {
                            wickets = Number(val) || 0;
                        } else if (displayName.includes("average") || displayName.includes("avg")) {
                            avg = Number(val) || 0;
                        } else if (displayName.includes("economy") || displayName.includes("eco")) {
                            economy = Number(val) || 0;
                        } else if (displayName.includes("strikerate") || displayName.includes("strike rate") || displayName.includes("sr")) {
                            strikeRate = Number(val) || 0;
                        } else if (displayName.includes("acq") || displayName.includes("acquisition")) {
                            const acqStr = String(val).toLowerCase();
                            if (acqStr.includes("retain")) acqType = "Retained";
                            else if (acqStr.includes("rtm")) acqType = "RTM";
                            else acqType = "Auction";
                        } else if (displayName.includes("tier")) {
                            const tStr = String(val).toLowerCase();
                            if (tStr.includes("marquee")) tier = "Elite";
                            else if (tStr.includes("premium")) tier = "Premium";
                            else if (tStr.includes("value")) tier = "Value";
                            else tier = "Budget";
                        } else if (displayName.includes("valuation")) {
                            valuationScore = Number(val) || 50;
                        } else if (displayName.includes("roi")) {
                            roiScore = Number(val) || 0;
                        }
                    }
                }

                // Calculations fallback
                if (roiScore === 0 && price > 0) {
                    roiScore = Math.round((runs + (wickets * 25)) / price);
                }
                if (valuationScore === 50) {
                    valuationScore = Math.min(Math.round(runs / 10 + wickets * 4), 98);
                    if (valuationScore < 20) valuationScore = 35;
                }
                if (tier === ("Regular" as any)) {
                    tier = price >= 11 ? "Elite" : price >= 5 ? "Premium" : price >= 2 ? "Value" : "Budget";
                }

                players.push({
                    name, team, role, price, matches, runs, wickets, avg, economy, strikeRate, acqType, tier, valuationScore, roiScore
                });
            }

            // Re-render visual with dynamic data
            this.root.render(React.createElement(App, { players }));

            this.events.renderingFinished(options);
        }
        catch (error) {
            console.log('Error in update method', error);
            this.events.renderingFailed(options, String(error))
        }
    }

    /**
     * Returns properties pane formatting model content hierarchies, properties and latest formatting values, Then populate properties pane.
     * This method is called once every time we open properties pane or when the user edit any format property. 
     */
    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}