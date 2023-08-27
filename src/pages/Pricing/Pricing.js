import React from 'react';

import { Button } from '~/components';
import PersonalPlan from './PersonalPlan';
import ProfessionalPlan from './ProfessionalPlan';
import TeamPlan from './TeamPlan';
import EnterprisePlan from './EnterprisePlan';
import FAQs from './FAQs';

function Pricing() {
    return (
        <section className="max-w-[71.25rem] px-4 mx-auto">
            <div className="py-8">
                <h4 className="font-semibold text-xl">Plan & Pricing</h4>
                <p className="text-slate-500">Simple pricing. No hidden fees. Advanced Features for your business.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <PersonalPlan />
                <ProfessionalPlan />
                <TeamPlan />
                <EnterprisePlan />
            </div>
            <div className="flex flex-col items-center mt-16">
                <h4 className="p-4 text-2xl font-semibold">Didn't find what you were looking for?</h4>
                <Button
                    className="font-semibold text-slate-600 ease-in-out duration-200 border border-blue-500 hover:bg-blue-100/50"
                    size="large"
                    type="button"
                >
                    Make a suggestion
                </Button>
            </div>
            <FAQs />
        </section>
    );
}

export default Pricing;
