import DynamicTable from '@atlaskit/dynamic-table';
import React from 'react';
import { createUseStyles } from 'react-jss';
import { getLinkToProfile, getTimeLabel } from '../../../../services/utils/common';
import { useCommonStyles } from '../../../../services/utils/common_classes';
import { REPORT_DEAL_TYPES } from '../../../../services/utils/constant';

const useStyles = createUseStyles({
    styleForHead: {
        '& th:first-child': {
            paddingLeft: '.5rem',
        },
        '& th:hover': {
            background: 'white',
        }
    }
})
const TableOfUsersReporting = (props) => {
    const { type, dataRows, isLoading } = props;
    const classes = useStyles();
    const commonClasses = useCommonStyles();

    const DealHead = () => {
        return {
            className: classes.styleForHead,
            cells: [
              {
                key: "number",
                content: "STT",
                width: 1,
              },
              {
                  key: "userName",
                  content: "Người dùng",
                  width: 2,
              },
              {
                  isSortable: true,
                  key: "reportedAt",
                  content: "Thời gian báo cáo",
                  width: 3,
              },
            {
                isSortable: true,
                key: "reportType",
                content: "Loại báo cáo",
                shouldTruncate: true,
                width: 3,
              },
              {
                  key: "reportContent",
                  content: "Nội dung",
                  shouldTruncate: true,
                  width: 5,
            },
            ],
        }
    }

    const CommentHead = () => {
        return {
            className: classes.styleForHead,
            cells: [
                {
                key: "number",
                content: "STT",
                width: 1,
                },
                {
                    key: "userName",
                    content: "Người dùng",
                    width: 2,
                },
                {
                    isSortable: true,
                    key: "reportedAt",
                    content: "Thời gian báo cáo",
                    width: 3,
                },
                {
                    key: "reportContent",
                    content: "Nội dung",
                    shouldTruncate: true,
                    width: 5,
            },
            ],
        }
    }

    
    const DealRows = () => {
        return dataRows && (
            dataRows.map((item, index) => ({
                key: item.id,
                cells: [
                    {
                        width: 1,
                        key: "number",
                        content: (<div style={{paddingLeft: '.5rem'}}>{index+1}</div>)
                    },
                    {
                        width: 2,
                        key: "userName",
                        content: (<a href={getLinkToProfile(item.username)} target="_blank" style={{color: "inherit", textDecoration: "none", fontWeight: '500'}}>{item.user_info.displayName}</a>)
                    },
                    {
                        width: 3,
                        key: item.reported_at,
                        content: (<div>{getTimeLabel(item.reported_at)}</div>)
                    },
                    {
                        width: 3,
                        key: item.type,
                        content: (<div>{item.type === "others" 
                                ? "Vi phạm khác" 
                                : REPORT_DEAL_TYPES.filter((type) => type.key === item.type)[0].label}
                            </div>
                        ) 
                    },
                    {
                        width: 5,
                        key: "reportedContent",
                        content: (<div>{item.content}</div>)
                    }
                ]
            }))
        );
    }

    
    const CommentRows = () => {
        return dataRows && (
            dataRows.map((item, index) => ({
                key: item.id,
                cells: [
                    {
                        width: 1,
                        key: "number",
                        content: (<div style={{paddingLeft: '.5rem'}}>{index+1}</div>)
                    },
                    {
                        width: 2,
                        key: "userName",
                        content: (<a href={getLinkToProfile(item.username)} target="_blank" style={{color: "inherit", textDecoration: "none", fontWeight: '500'}}>{item.user_info.displayName}</a>)
                    },
                    {
                        width: 3,
                        key: item.reported_at,
                        content: (<div>{getTimeLabel(item.reported_at)}</div>)
                    },
                    {
                        width: 5,
                        key: "reportedContent",
                        content: (<div>{item.report_content}</div>)
                    }
                ]
            }))
        );
    }

    const renderHead = () => {
        if (type === "reportedDeal") return DealHead();
        else return CommentHead();
    }

    const renderRows = () => {
        if (type === "reportedDeal") return DealRows();
        else return CommentRows();
    }

    return (
        <div className={commonClasses.dynamicTableContainer}>
            <DynamicTable 
                head={renderHead()}
                rows={renderRows()}
                loadingSpinnerSize="small"
                isLoading={isLoading}
                rowsPerPage={10}
            />
        </div>
    );
}

export default TableOfUsersReporting;
