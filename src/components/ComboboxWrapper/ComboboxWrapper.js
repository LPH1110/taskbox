import { Fragment, useState } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import classNames from 'classnames/bind';
import styles from './ComboboxWrapper.module.scss';

const cx = classNames.bind(styles);

// To use this component, you have to initialize [selected, setSelected] as state in parent form component and pass them as props

const ComboboxWrapper = ({ selected, setSelected, data, label, name }) => {
    const [query, setQuery] = useState('');

    const filteredData =
        query === ''
            ? data
            : data.filter((item) => {
                  return item?.title.toLowerCase().includes(query?.toLowerCase());
              });

    return (
        <Combobox value={selected} onChange={setSelected}>
            <div className="relative mt-1">
                <label className="text-slate-600 font-semibold" htmlFor={name}>
                    {label}
                </label>
                <div className="my-2 relative w-full cursor-pointer rounded-md border border-slate-200 p-2 ring ring-transparent focus:ring-blue-500 ease duration-200">
                    <Combobox.Input
                        name={name}
                        id={name}
                        className="outline-none cursor-pointer"
                        onChange={(e) => setQuery(e.target.value)}
                        displayValue={(item) => item?.title}
                        readOnly
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </Combobox.Button>
                </div>
                <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    afterLeave={() => setQuery('')}
                >
                    <Combobox.Options className={cx('combobox_options')}>
                        {filteredData.map((item) => (
                            <Combobox.Option value={item} className={cx('combobox_option')} key={item?.id}>
                                <p className="w-9 h-9 p-2">{item?.icon}</p>
                                <div className="flex flex-col w-full items-start">
                                    <h4>{item?.title}</h4>
                                    <p className="text-sm text-description">{item?.description}</p>
                                </div>
                                <CheckIcon className="hidden ui-selected:block w-5 h-5" />
                            </Combobox.Option>
                        ))}
                    </Combobox.Options>
                </Transition>
            </div>
        </Combobox>
    );
};

export default ComboboxWrapper;
