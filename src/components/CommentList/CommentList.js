import React, { useCallback, useEffect, useState } from 'react';
import Comment from '../Comment';
import { fetchComments } from '~/lib/actions';

const CommentList = ({ comments, setComments }) => {
    return (
        <div className="flex flex-col gap-2">
            {comments.map((comment) => (
                <Comment setComments={setComments} key={comment.id} data={comment} />
            ))}
        </div>
    );
};

export default CommentList;
