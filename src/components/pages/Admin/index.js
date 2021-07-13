import React from "react";
import { useSelector } from "react-redux";
import { currentUserSelector } from "../../../selectors/usersSelector";
import { hasEditorPermission, hasModeratorPermission } from "../../../services/utils/common";
import EmptyPageMessage from "../../common/components/EmptyPageNotification";
import AdminHomepage from "./AdminHomepage";

const AdminMain = () => {
    const currentUser = useSelector(currentUserSelector);
    // const isLoading = useSelector(isGettingCurrentUserSelector);
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get("dealId");
    const commentId = searchParams.get("commentId");

    // const notAccessed = !isLoading && (
    //                        !currentUser.id
    //                     || (!hasEditorPermission(currentUser.role) && !hasModeratorPermission(currentUser.role))
    //                     || (commentId && !hasModeratorPermission(currentUser.role) )  
    //                 )
    // if (notAccessed)
    //     return <EmptyPageMessage />;
    // else
    //     return <AdminHomepage dealId={id} commentId={commentId} />

    const hasEditorPer = currentUser && hasEditorPermission(currentUser.role);
    const hasModeratorPer = currentUser && hasModeratorPermission(currentUser.role);

    if (id && hasEditorPer)
        return <AdminHomepage dealId={id} />

    if (commentId && hasModeratorPer)
        return <AdminHomepage commentId={commentId} />

    if (!id && !commentId && (hasEditorPer || hasModeratorPer))
        return <AdminHomepage />
    
    return <EmptyPageMessage />;
}

export default AdminMain;