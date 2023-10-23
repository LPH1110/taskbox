import { ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '~/components';
const thumb = require('~/assets/imgs/under_dev.png');

const UndevelopedSite = () => {
    return (
        <div className="h-full">
            <div className="h-full flexCenter flex-col">
                <div className="text-center text-2xl text-description">
                    <img src={thumb} alt="under_dev" />
                </div>
                <Button
                    onClick={() => window.history.back()}
                    leftIcon={<ArrowUturnLeftIcon className="w-5 h-5" />}
                    size="medium"
                    className="bg-blue-500 text-white hover:bg-blue-500/80 ease duration-200"
                >
                    Return
                </Button>
            </div>
        </div>
    );
};

export default UndevelopedSite;
