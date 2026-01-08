import { footerpage } from './components/footer.component';
import { Aboutus } from './components/aboutus.component';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TopbarWidget } from './components/topbarwidget.component';
import { HeroWidget } from './components/herowidget';
import { FeaturesWidget } from './components/featureswidget';
import { HighlightsWidget } from './components/highlightswidget';
import { PricingWidget } from './components/pricingwidget';
import { FooterWidget } from './components/footerwidget';
import { Topbar } from "./components/topbar.component";
import { Firstcontent } from "./components/firstcontent.component";
import { Bookingpage } from "./components/bookingpage.component";
import { Schemespage } from "./components/schemespage.component";
import { loanoptionpage } from "./components/loanoptionpage.component";

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [RouterModule, TopbarWidget, HeroWidget, FeaturesWidget, HighlightsWidget, PricingWidget, FooterWidget, RippleModule, StyleClassModule, ButtonModule, DividerModule],
    template: `
        <div class="bg-surface-0 dark:bg-surface-900">
            <div id="home" class="landing-wrapper overflow-hidden">
                <!-- <topbar class="py-6 px-6 mx-0 md:mx-12 lg:mx-20 lg:px-20 flex items-center justify-between relative lg:static" />
                <first-content></first-content>
<booking-page></booking-page>
<schemes-page></schemes-page>
<loanoption-page></loanoption-page>
<about-us></about-us>
<footerpage></footerpage> -->

                <topbar-widget class="py-6 px-6 mx-0 md:mx-12 lg:mx-20 lg:px-20 flex items-center justify-between relative lg:static" />
                <hero-widget />
                <features-widget />
                <highlights-widget />
                <pricing-widget />
                <footer-widget />
            </div>
        </div>
    `,
    styles:``,
})
export class Landing {}
