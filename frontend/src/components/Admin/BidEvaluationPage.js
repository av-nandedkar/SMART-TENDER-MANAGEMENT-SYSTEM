import React, { useEffect, useState } from 'react';
import { fetchTendersbymail, fetchBidsByTenderId } from '../../services/tenderService';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2'; // Import SweetAlert2
import emailjs from 'emailjs-com'; // Import EmailJS
import { json2csv } from 'json2csv'; // Import json2csv for CSV export
import { parse } from 'json2csv'; // Import json2csv




import './BidEvaluationPage.css';

const BidEvaluationPage = () => {
  const [tenders, setTenders] = useState([]);
  const [bids, setBids] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTender, setExpandedTender] = useState(null); // Tracks the expanded tender for bid view
  const navigate = useNavigate();


  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const email = storedUser?.email;

    if (!email) {
      setError("User email not found in localStorage.");
      setLoading(false);
      return;
    }

    const getTenders = async () => {
      try {
        const data = await fetchTendersbymail(email);
        setTenders(data);
      } catch (err) {
        setError(`Failed to fetch tenders: ${err.message || err}`);
      } finally {
        setLoading(false);
      }
    };

    getTenders();
  }, []);


  const handleToggleBids = async (tenderId) => {
    if (expandedTender === tenderId) {
      // Collapse bids for the tender
      setExpandedTender(null);
    } else {
      try {
        // Fetch bids for the tender
        const fetchedBids = await fetchBidsByTenderId(tenderId);
        console.log("Fetched Bids:", fetchedBids);

        // Get the tender's TenderPropAmount
        const tender = tenders.find((tender) => tender._id === tenderId);
        const tenderPropAmounts = tender?.TenderPropAmount || [];
        console.log("TenderPropAmounts:", tenderPropAmounts);

        // Process each bid
        const bidsWithScores = await Promise.all(
          fetchedBids.map(async (bid) => {
            try {
              const response = await axios.get(`http://localhost:5000/api/bids/${bid._id}/evaluation`);
              if (response.data?.comments === "Evaluated") {
                return { ...bid, evaluationScore: response.data.evaluationScore, evaluationStatus: response.data.evaluationStatus };
              }
            } catch (error) {
              if (error.response?.status !== 404) {
                console.error(`Error fetching evaluation for bid ${bid._id}:`, error);
                return { ...bid, evaluationScore: 'Error Fetching Evaluation', evaluationStatus: 'Error' };
              }
            }


            // If not evaluated, calculate the evaluation score
            const bidderPropAmounts = bid.BidderPropAmount || [];
            console.log(`BidderPropAmounts for Bid ${bid._id}:`, bidderPropAmounts);


            const evaluationScore = tenderPropAmounts.reduce((acc, tenderAmount, index) => {
              const bidderAmount = bidderPropAmounts[index] || 0;
              const ratio = bidderAmount > 0 ? tenderAmount / bidderAmount : 0;
            
              // If the ratio is less than 1, subtract it, otherwise add it
              if (ratio < 1) {
                return acc - ratio;  // Subtract if ratio is less than 1
              } else {
                return acc + Math.max(ratio, 1);  // Add the ratio if it's 1 or more
              }
            }, 0);
            


            console.log(`Evaluation Score for Bid ${bid._id}:`, evaluationScore);

            // Post the evaluation score to the database
            await axios.post(`http://localhost:5000/api/bids/${bid._id}/evaluation`, {
              evaluationScore: evaluationScore.toFixed(3),  // Format score to 3 decimal places
              comments: 'Evaluated',
            });
            

            // Return the bid with its calculated evaluation score
            return { ...bid, evaluationScore };
          })
        );

        // After fetching bidsWithScores
        const maxScoreBid = bidsWithScores.reduce((maxBid, currentBid) => {
          return currentBid.evaluationScore > maxBid.evaluationScore ? currentBid : maxBid;
        }, { evaluationScore: -Infinity });


        // Update the bids state with the processed bids
        setBids((prevBids) => ({
          ...prevBids,
          [tenderId]: bidsWithScores,
        }));

        setExpandedTender(tenderId); // Expand the tender
      } catch (err) {
        console.error(`Failed to fetch or process bids for tender ${tenderId}:`, err);
      }
    }
  };

  
  
  

  const handleApproveBid = async (tenderId, bidId) => {
    try {
      const bidsForTender = bids[tenderId];
      const tender = tenders.find((t) => t._id === tenderId);
      const bidToApprove = bidsForTender.find((bid) => bid._id === bidId);
      console.log("BidToApprove:", bidToApprove);
      if (!tender || !bidToApprove) {
        throw new Error('Tender or Bid details not found.');
      }

      // Update all bids for the tender to "Rejected"
      await Promise.all(
        bidsForTender.map((bid) =>
          axios.put(`http://localhost:5000/api/bids/${bid._id}/evaluation`, {
            evaluationStatus: 'Rejected',
          })
        )
      );

      // Update the selected bid to "Approved"
      await axios.put(`http://localhost:5000/api/bids/${bidId}/evaluation`, {
        evaluationStatus: 'Approved',
      });

      // Prepare email parameters
      const emailParams = {
        tender_id: tender._id,
        tender_title: tender.title,
        tender_eligibility: tender.eligibility || 'N/A',
        tender_description: tender.description || 'N/A',
        tender_type: tender.type || 'N/A',
        tender_startDate: tender.startDate,
        tender_endDate: tender.endDate,
        bid_id: bidToApprove._id,
        bidder_name: bidToApprove.bidderName,
        bidder_email: bidToApprove.email,
        bid_amount: bidToApprove.bidAmount,
        evaluation_score: bidToApprove.evaluationScore || 'N/A',
      };

      // Log email parameters before sending
      console.log('Email Parameters:', emailParams);

      // Send email using EmailJS
      emailjs
        .send('service_vnehurc', 'template_3pxnu0p', emailParams, 'fn2uxIMhd1q5E1SW9')
        .then(() => {
          console.log('Email sent successfully.');
        })
        .catch((error) => {
          console.error('Failed to send email:', error);
        });

      // Show SweetAlert notification
      Swal.fire({
        icon: 'success',
        title: 'Bid Approved',
        text: 'The bid has been successfully Approved and Email is sent To Respective Bidder.',
      }).then(() => {
        // Reload the page
        window.location.reload();
      });
    } catch (err) {
      console.error(`Failed to approve bid for tender ${tenderId}:`, err);

      // Show error SweetAlert notification
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to approve the bid. Please try again later.',
      });
    }
  };


  const formatDate = (date) => {
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? 'Invalid Date' : parsedDate.toLocaleDateString();
  };


  const handleExportToCSV = () => {
    // Flatten all tender and bid data into a single array
    const allTendersBids = tenders.flatMap((tender) => {
      const tenderBids = bids[tender._id] || [];
      
      // First, prepare the tender details row with all the fields from the schema
      const tenderDetails = [{
        TenderID: tender._id,
        Email: tender.email,
        TenderTitle: tender.title,
        Eligibility: tender.eligibility,
        TenderDescription: tender.description || 'N/A',
        TenderType: tender.type,
        TenderStatus: tender.status,
        TenderStartDate: tender.startDate,
        TenderEndDate: tender.endDate,
        Materials: tender.materials.join(', ') || 'N/A', // Join materials array into a string
        Quantity: tender.quantity.join(', ') || 'N/A', // Join quantity array into a string
        TenderPropAmount: tender.TenderPropAmount.join(', ') || 'N/A', // Join TenderPropAmount array into a string
        TotalQuotation: tender.Totalquotation,
        BidID: '', // Empty since it's for the tender row
        BidderName: '', // Empty since it's for the tender row
        BidAmount: '', // Empty since it's for the tender row
        BidExpiryDate: '', // Empty since it's for the tender row
        EvaluationScore: '', // Empty since it's for the tender row
        EvaluationStatus: '', // Empty since it's for the tender row
        CompanyName: '', // Empty for tender row
        CompanyRegNumber: '', // Empty for tender row
        BidderEmail: '', // Empty for tender row
        BidderPhoneNumber: '', // Empty for tender row
        Description: '', // Empty for tender row
        AdditionalNotes: '', // Empty for tender row
        BidderPropAmount: '', // Empty for tender row
      }];
      
      // Now, prepare the bid details for each bid under this tender
      const bidDetails = tenderBids.map((bid) => ({
        BidID: bid._id,
        BidderName: bid.bidderName,
        BidAmount: bid.bidAmount,
        BidExpiryDate: bid.expiryDate,
        EvaluationScore: bid.evaluationScore ? bid.evaluationScore.toFixed(3) : 'N/A',
        EvaluationStatus: bid.evaluationStatus || 'N/A',
        CompanyName: bid.companyName,
        CompanyRegNumber: bid.companyRegNumber || 'N/A',
        BidderEmail: bid.email,
        BidderPhoneNumber: bid.phoneNumber,
        Description: bid.description,
        AdditionalNotes: bid.additionalNotes || 'N/A',
        BidderPropAmount: bid.BidderPropAmount.join(', ') || 'N/A', // Join BidderPropAmount array into a string
      }));
  
      // Return both tender details row and bid details rows, with tender row at the top
      return tenderDetails.concat(bidDetails);
    });
  
    try {
      // Parse the data to CSV format
      const csv = parse(allTendersBids);
      
      // Create a Blob from the CSV string
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      
      // Create a link element to trigger the download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'tender._id.csv';  // Name of the file
      link.click(); // Trigger the download
    } catch (error) {
      console.error("Error exporting to CSV:", error);
    }
  };
  
  

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="bid-evaluation-container">
      <h2>Bid Evaluation</h2>
    

      <table className="tender-table">
        <thead>
          <tr>
            <th>Sr. No.</th>
            <th>Tender ID</th>
            <th>Title</th>
            <th>Total Quotation Amount</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tenders.length > 0 ? (
            tenders.map((tender, index) => (
              <React.Fragment key={tender._id}>
                {/* Tender Row */}
                <tr>
                  <td>{index + 1}</td>
                  <td>{tender._id}</td>
                  <td>{tender.title}</td>
                  <td>{tender.Totalquotation ? tender.Totalquotation : 'N/A'}</td>
                  <td>{formatDate(tender.startDate)}</td>
                  <td>{formatDate(tender.endDate)}</td>
                  <td>{tender.status}</td>
                  <td>
                    <button onClick={() => handleToggleBids(tender._id)}>
                      {expandedTender === tender._id ? 'Hide Bids' : 'View Bids'}
                    </button>
                  </td>
                </tr>

                {/* Bid Details Row */}
                {expandedTender === tender._id && (

                  <tr>
                    <td colSpan="8">                                 <h3 className='highlight-max-score'>※ Suggested Bid Is Highlighted</h3>  

                      {bids[tender._id]?.length > 0 ? (
                        <table className="bids-table">

                          <thead>
                            <tr>
                              <th>Bid ID</th>
                              <th>Bidder Name</th>
                              <th>Total Bid Amount</th>
                              <th>Expiry Date</th>
                              <th>Quotation</th>
                              <th>Evaluation Score</th>
                              <th>Status</th> {/* Add this column for Status */}



                            </tr>
                          </thead>
                          <tbody>
                            {bids[tender._id].map((bid) => {
                              // Find the bid with the highest score
                              const maxScoreBid = bids[tender._id].reduce((maxBid, currentBid) =>
                                currentBid.evaluationScore > maxBid.evaluationScore ? currentBid : maxBid
                                , { evaluationScore: -Infinity });

                              const isMaxScoreBid = bid._id === maxScoreBid._id; // Check if this is the highest scored bid

                              return (

                                <tr key={bid._id} className={bid._id === maxScoreBid?._id ? 'highlight-max-score' : ''}>

                                  <td>{bid._id}</td>
                                  <td>{bid.bidderName}</td>
                                  <td>{bid.bidAmount}</td>
                                  <td>{formatDate(bid.expiryDate)}</td>

                                  <td>
                                    <button onClick={() => navigate(`/bidder/quotation/${bid._id}`)}>Quotation</button>
                                  </td>

                                  <td>{bid.evaluationScore ? bid.evaluationScore.toFixed(3) : '-'}</td>

                                  <td>
                                    {typeof bid.evaluationStatus === 'undefined' || bid.evaluationStatus === '' || bid.evaluationStatus === null ? (
                                      <button onClick={() => handleApproveBid(tender._id, bid._id)}>Approve</button>
                                    ) : (
                                      bid.evaluationStatus // Display the status (Approved or Rejected)
                                    )}
                                    
                                  </td>



                                </tr>
                                

                              );
                              
                            })}
                          </tbody>
                      
                        </table>
                        
                      ) : (
                        <p>No bids available for this tender.</p>
                      )}
                    </td>
                    
                  </tr>
                )}
              </React.Fragment>
            ))
          ) : (
            <tr>
              <td colSpan="8">No tenders available</td>
            </tr>
          )}
        </tbody>
     
      </table>
      <div  className='Only-Viewed-Bids-Would-Be-Included-In-This-Sheet'>
      <h4>Only Viewed Bids Would Be Included In This Sheet 👉 </h4>
      <button onClick={handleExportToCSV} className='export-csv-button'>
  Export to CSV
</button></div>
    </div>
  );

};

export default BidEvaluationPage;
