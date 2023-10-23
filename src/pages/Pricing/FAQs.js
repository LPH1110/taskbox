import React from 'react';
import { Disclosure, Transition } from '@headlessui/react';
import { ChevronRightIcon, PlusSmallIcon, MinusSmallIcon } from '@heroicons/react/24/solid';
import { v4 as uuidv4 } from 'uuid';

const questions = [
    {
        id: uuidv4(),
        name: 'Does Taskbox offer a Premium free trial',
        answer: 'We sure do. All users can enroll their Workspace in a free trial of Taskbox Premium. With that trial your Workspace will get access to create unlimited Taskbox boards, automate as much as you’d like, take advantage of Timeline, Dashboard, and other new views, and much more!',
    },
    {
        id: uuidv4(),
        name: 'Do you offer any discounted plans?',
        answer: 'Yes! Taskbox offers both a non-profit community discount as well as an education discount.',
    },
    {
        id: uuidv4(),
        name: 'What payment methods do you accept?',
        answer: 'You can purchase a monthly or annual Taskbox Personal or Team subscription with any major credit card. We offer more options for Enterprise customers, if you’re interested in learning more about Taskbox Enterprise contact our sales team.',
    },
    {
        id: uuidv4(),
        name: 'How do I cancel my Taskbox Personal or Team subscription?',
        answer: 'If you aren’t 100% satisfied with Taskbox Personal or Team you may downgrade at any time. When a team downgrades from Personal or Team, it retains its Personal or Team features and unlimited boards until the end of its prepaid service period. At the end of its prepaid service period, it becomes a free Taskbox Workspace that can hold 10 boards. Learn more about canceling your Personal or Team subscription here.',
    },
];

function FAQs() {
    return (
        <div className="my-16">
            <h4 className="p-4 text-center font-bold text-4xl">Frequently Asked Questions</h4>
            <div>
                {questions.map((q) => (
                    <div className="py-4" key={q.id}>
                        <Disclosure>
                            {({ open }) => (
                                <>
                                    <Disclosure.Button className="flex items-center text-2xl font-semibold text-left">
                                        <span className="mr-1">
                                            {open ? (
                                                <MinusSmallIcon className="w-5 h-5" />
                                            ) : (
                                                <PlusSmallIcon className="w-5 h-5" />
                                            )}
                                        </span>
                                        {q.name}
                                    </Disclosure.Button>
                                    <Transition
                                        show={open}
                                        enter="transition duration-100 ease"
                                        enterFrom="transform scale-95 opacity-0"
                                        enterTo="transform scale-100 opacity-100"
                                        leave="transition duration-100 ease"
                                        leaveFrom="transform scale-100 opacity-100"
                                        leaveTo="transform scale-95 opacity-0"
                                    >
                                        <Disclosure.Panel className="py-2 px-5 text-xl text-slate-600">
                                            {q.answer}
                                        </Disclosure.Panel>
                                    </Transition>
                                </>
                            )}
                        </Disclosure>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default FAQs;
