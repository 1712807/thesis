import { createUseStyles } from "react-jss";
import { TEXT_INPUT_CUSTOM_STYLE } from "./constant";

export const useCommonStyles = createUseStyles({
    mainButton: {
        backgroundColor: "#11a250 !important",
        // textTransform: "uppercase",
        fontWeight: "bold !important",
        "&:hover": {
            backgroundColor: "#0cac51 !important",
        },
        "& span": {
            color: "white !important",
        }
    },
    listContainer: {
        backgroundColor: "white",
        borderRadius: "5px",
        width: "100%",
    },
    popupContent: {
        borderRadius: "5px",
        display: "flex",
        flexDirection: "column",
        fontSize: "0.75rem",
        zIndex: "9999",
        "& > div": {
            cursor: "pointer",
            padding: "0.5rem",
            "&:hover": {
                backgroundColor: "#f2f2f2",
            }
        },
        "& a": {
            color: "black",
            textDecoration: "none",
        },
    },
    filters: {
        display: "flex",
        flexWrap: "wrap",
        "& svg": {
            marginTop: "0.15rem",
        },
        "& > div": {
            fontSize: "0.8rem",
            fontWeight: "500",
            padding: "0.5rem",
            flexWrap: "wrap",
            width: "calc(min(100%, fit-content))",
            cursor: "pointer",
            backgroundColor: "white",
            border: "thin solid rgba(4, 135, 229, 1)",
        }
    },
    asterisk: {
        color: "tomato",
        fontSize: "0.8rem",
    },
    expandOptionsIcon: {
        cursor: "pointer",
        "& svg": {
            width: "0.75rem !important",
            marginTop: "0.25rem !important"
        }
    },
    dealsPreviewWithInlineEditContainer: {
        // marginBottom: "1rem",
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        backgroundColor: "white",
        borderRadius: "5px",
        marginTop: "0.25rem",
        width: "100%",
        maxWidth: "100%",
        "& > div": {
            padding: "1rem",
            // "&:not(:last-child)": {
                borderBottom: "medium solid rgb(232, 232, 232)",
            // },
            "&:first-child": {
                borderTopLeftRadius: "5px",
                borderTopRightRadius: "5px",
            },
            "&:last-child": {
                borderBottomLeftRadius: "5px",
                borderBottomRightRadius: "5px",
            },
            "& h4": {
                cursor: "pointer",
                "&:hover": {
                    color: "rgb(0, 112, 243)",
                }
            },
        }
    },
    emptyDealMsg: {
        padding: "1rem 0",
        fontStyle: "italic",
        color: "gray",
        fontSize: "0.85rem",
    },
    formContainer: {
        "& > div:not(:last-child)": {
            marginBottom: "1rem",
        },
        padding: "2rem",
        margin: "2rem auto",
        borderRadius: "5px",
        backgroundColor: "white",
        width: "30vw",
        "@media screen and (max-width: 992px)": {
            width: "35vw",
        },
        "@media screen and (max-width: 768px)": {
            width: "40vw",
        },
        "@media screen and (max-width: 576px)": {
            width: "100%",
        }
    },
    formHeader: {
        "& h3": {
            textAlign: "center",
            fontSize: "1.5rem",
            fontWeight: "500",
            marginTop: "0 !important",
            marginBottom: "0.5rem !important",
        },
        width: "100%",
    },
    datepickerContainer: {
        width: "100%", 
        marginTop: "0.25rem",
        "& > div": {
            fontSize: "0.875rem !important",
            ...TEXT_INPUT_CUSTOM_STYLE
        }
    },
    postedOn: {
        display: "flex",
        flexDirection: "column",
        fontSize: "0.8rem",
        "& > div": {
            display: "flex",
            "& div": {
                "& svg": {
                    color: "rgb(252, 166, 9)"
                }
            }
        }
    },
    dealActionsForEditor: {
        display: "flex",
        justifyContent: "center",
        cursor: "pointer",
        fontSize: "1.25rem",
        "& > div": {
            opacity: "0.75",
            padding: "0.25rem 0.5rem",
            "&:hover": {
                backgroundColor: "#f2f2f2",
                borderRadius: "5px"
            }
        }
    },
    showUsersReportedLabel: {
        fontWeight: '500',
        fontSize: "0.875rem",
        cursor: 'pointer',
        width: 'fit-content',
        alignItems: "center",
        color: "rgb(107, 119, 140) !important",
        marginBottom: '.4rem',
        '&:hover': {
            color: "rgb(137, 147, 164) !important",
        }
    },
    paragraph: {
        wordBreak: "break-word",
        whiteSpace: "pre-wrap",
        lineHeight: "1.3rem",
    },
    commentCard: {
        display: 'flex',
        fontSize: '0.9rem',
        padding: '.5rem 0',
        marginTop: '.5rem',
        "& > div:not(:last-child)": {
            marginRight: "0.5rem"
        },
        "& > a": {
            marginRight: "0.5rem",
            height: 'fit-content',
        },
        borderTop: "thin solid lightgray",
    },
    userAvatar: {
        marginRight: '0.25rem',
        cursor: 'pointer',
        '&:hover': {
            filter: 'grayscale(.4)',
        },
    },
    commentContentContainer: {
        // borderRadius: '1rem',
        paddingBottom: '0.3rem',
        whiteSpace: 'pre-wrap',
        overflowWrap: 'anywhere',
        width: '100%',
        // cursor: 'pointer',
    },
    commentOwnerName: {
        cursor: 'pointer',
        fontWeight: 'bold',
        textDecoration: 'none',
        color: 'black',
        '&:hover': {
          textDecoration: 'underline',
        },
    },
    dynamicTableContainer: {
        "& tr": {
            "&:nth-child(even)": {
                backgroundColor: "#F4F5F7"
            },
            "&:nth-child(odd)": {
                backgroundColor: "white"
            },
        },
        "& thead": {
            "& tr": {
                backgroundColor: "rgb(233, 235, 238) !important",
            },
            "& th": {
                "&:hover": {
                    backgroundColor: "rgb(233, 235, 238) !important",
                }
            }
        }
    },
    adminManagementTitle: {
        color: '#0052CC', 
        fontWeight: "500",
        padding: "4px 0 2px 0",
        lineHeight: 1.8,
        borderBottom: "2px solid #0052CC", 
        marginBottom: "0.75rem",
        width: "fit-content",
    },
    customSelect: {
        "& > div": {
            fontSize: "0.875rem !important",
            backgroundColor: "white !important",
            borderWidth: "1.5px !important",
            borderColor: "#DFE1E6 !important",
            "&:focus-within": {
                borderColor: "rgb(76, 154, 255) !important",
            },
        },
        "& > div:first-child:hover": {
            backgroundColor: "#f1f1f1 !important"
        }
    },
    inputForm: {
        "& > div:not(:last-child)": {
            marginBottom: "1rem",
        },
        "& > div > div:first-child": {
            marginBottom: "0.25rem",
            fontSize: "0.875rem",
            fontWeight: "500"
        }
    },
    userLevel: {
        fontSize: "0.7rem",
        fontWeight: "500",
        backgroundImage: "linear-gradient(rgb(252, 211, 9), rgb(252, 166, 9))",
        color: "white",
        padding: "3px 8px",
        borderRadius: "3px",
        maxHeight: "20px",
        display: "flex",
        justifyContent: "center",
        width: "fit-content",
        "& div": {
            marginTop: "-1px"
        }
    },
    nonBgUserLevel: {
        backgroundColor: "transparent", 
        padding: 0, 
        cursor: "pointer",
        backgroundImage: "none", 
        color: "orange",
        marginTop: '.15rem',
    },
    categoryLabel: {
        padding: "0.75rem",
        fontSize: "0.9rem",
        color: "rgb(91, 91, 91)",
        cursor: "pointer",
        "&:hover": {
            color: "rgb(4, 135, 229)"
        },
        maxHeight: "1.5rem",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        "@media screen and (max-width: 1200px)": {
            padding: "0.5rem 0.25rem",
            fontSize: "0.875rem",
        }
    },
    categoryLabelSelected: {
        borderBottom: "2px solid rgb(4, 135, 229)",
        color: "rgb(4, 135, 229)"
    }
})

