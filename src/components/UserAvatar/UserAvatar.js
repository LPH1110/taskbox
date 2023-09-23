import { UserAuth } from '~/contexts/AuthContext';

const UserAvatar = ({ photoURL, width, className = '' }) => {
    const { user } = UserAuth();
    let classes = `avatar p-1 rounded-full hover:bg-blue-100 ease-in-out duration-200 cursor-pointer`;
    return (
        <div className={classes}>
            <div className={`${width ? width : 'w-10 h-10'} rounded-full`}>
                <img src={photoURL || user?.photoURL} alt="user avatar" />
            </div>
        </div>
    );
};

export default UserAvatar;
